import WaveSurfer from 'wavesurfer.js'

const WAVEFORM_HEIGHT = 32
const WAVEFORM_BAR_WIDTH = 2
const WAVEFORM_BAR_GAP = 1

const VARIANT_COLORS = {
  blueair: {
    waveColor: 'rgba(1, 1, 1, 0.8)',
    progressColor: '#010101',
  },
  others: {
    waveColor: 'rgba(103, 103, 103, 0.8)',
    progressColor: '#676767',
  },
}

class SoundComparison extends HTMLElement {
  constructor() {
    super()

    this._selectors = {
      player: '[js-sound-comparison-player]',
      trigger: '[js-sound-comparison-trigger]',
      waveform: '[js-sound-comparison-waveform]',
    }

    this._players = []
  }

  connectedCallback() {
    this._players = []

    for (const element of this.querySelectorAll(this._selectors.player)) {
      const trigger = element.querySelector(this._selectors.trigger)
      const waveform = element.querySelector(this._selectors.waveform)
      const audioUrl = element.dataset.audioUrl

      if (!trigger || !waveform || !audioUrl) continue

      trigger.addEventListener('click', this._triggerOnClick)

      const player = { element, trigger, waveform, wavesurfer: null }
      this._players.push(player)
      this._initPlayer(player)
    }
  }

  disconnectedCallback() {
    for (const player of this._players) {
      player.trigger.removeEventListener('click', this._triggerOnClick)
      player.wavesurfer?.destroy()
    }

    this._players = []
  }

  _initPlayer = (player) => {
    const variant = player.element.dataset.variant === 'others' ? 'others' : 'blueair'
    const colors = VARIANT_COLORS[variant]

    player.waveform.dataset.loading = 'true'

    const wavesurfer = WaveSurfer.create({
      container: player.waveform,
      url: player.element.dataset.audioUrl,
      height: WAVEFORM_HEIGHT,
      barWidth: WAVEFORM_BAR_WIDTH,
      barGap: WAVEFORM_BAR_GAP,
      barRadius: 1,
      normalize: true,
      fillParent: true,
      interact: false,
      cursorWidth: 0,
      hideScrollbar: true,
      waveColor: colors.waveColor,
      progressColor: colors.progressColor,
    })

    player.wavesurfer = wavesurfer

    wavesurfer.on('loading', () => {
      player.waveform.dataset.loading = 'true'
    })

    wavesurfer.on('ready', () => {
      player.waveform.dataset.loading = 'false'
    })

    wavesurfer.on('error', () => {
      player.waveform.dataset.loading = 'false'
    })

    wavesurfer.on('play', () => {
      player.element.dataset.playing = 'true'
      this._setTriggerLabel(player, 'pause')
    })

    wavesurfer.on('pause', () => {
      player.element.dataset.playing = 'false'
      this._setTriggerLabel(player, 'play')
    })

    wavesurfer.on('finish', () => {
      player.element.dataset.playing = 'false'
      this._setTriggerLabel(player, 'play')
      wavesurfer.seekTo(0)
    })
  }

  _triggerOnClick = async (evt) => {
    const player = this._getPlayerFromTrigger(evt.currentTarget)

    if (!player?.wavesurfer) return

    if (player.wavesurfer.isPlaying()) {
      player.wavesurfer.pause()
      return
    }

    this._pauseAllExcept(player.element)

    try {
      await player.wavesurfer.play()
    } catch {
      player.element.dataset.playing = 'false'
      this._setTriggerLabel(player, 'play')
    }
  }

  _getPlayerFromTrigger(trigger) {
    return this._players.find((player) => player.trigger === trigger)
  }

  _pauseAllExcept(activeElement) {
    for (const player of this._players) {
      if (player.element === activeElement) continue

      player.wavesurfer?.pause()
      player.wavesurfer?.seekTo(0)
    }
  }

  _setTriggerLabel(player, state) {
    const label =
      state === 'pause'
        ? player.trigger.dataset.pauseLabel
        : player.trigger.dataset.playLabel

    if (label) {
      player.trigger.setAttribute('aria-label', label)
    }
  }
}

export default SoundComparison
