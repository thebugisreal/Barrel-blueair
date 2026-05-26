const WAVEFORM_BAR_COUNT = 36;
const MIN_BAR_HEIGHT = 4;
const MAX_BAR_HEIGHT = 22;
const BAR_HEIGHT_RANGE = MAX_BAR_HEIGHT - MIN_BAR_HEIGHT;

const waveformCache = new Map();
const waveformPending = new Map();

let sharedAudioContext;

class SoundComparison extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      player: '[js-sound-comparison-player]',
      audio: '[js-sound-comparison-audio]',
      trigger: '[js-sound-comparison-trigger]',
      waveform: '[js-sound-comparison-waveform]',
    };

    this._players = [];
    this._progressFrame = null;
  }

  connectedCallback() {
    this._players = [];
    this._progressFrame = null;

    for (const element of this.querySelectorAll(this._selectors.player)) {
      const audio = element.querySelector(this._selectors.audio);
      const trigger = element.querySelector(this._selectors.trigger);
      const waveform = element.querySelector(this._selectors.waveform);

      if (!audio || !trigger || !waveform) continue;

      trigger.addEventListener('click', this._triggerOnClick);
      audio.addEventListener('ended', this._audioOnEnded);

      this._players.push({ element, audio, trigger, waveform });
      this._initPlayer({ element, audio, trigger, waveform });
    }
  }

  disconnectedCallback() {
    this._cancelProgressLoop();

    for (const player of this._players) {
      player.trigger.removeEventListener('click', this._triggerOnClick);
      player.audio.removeEventListener('ended', this._audioOnEnded);
      player.audio.pause();
    }

    this._players = [];
  }

  _initPlayer = async (player) => {
    player.waveform.dataset.loading = 'true';

    try {
      this._buildWaveform(player.waveform, await this._getWaveformHeights(player.audio));
    } catch {
      this._buildWaveform(player.waveform, this._fallbackHeights());
    } finally {
      player.waveform.dataset.loading = 'false';
    }
  };

  _triggerOnClick = async (evt) => {
    const player = this._getPlayerFromTrigger(evt.currentTarget);

    if (!player) return;

    if (player.element.dataset.playing == 'true') {
      this._pausePlayer(player);
      return;
    }

    this._pauseAllExcept(player.element);
    await this._playPlayer(player);
  };

  _audioOnEnded = (evt) => {
    const player = this._getPlayerFromAudio(evt.currentTarget);

    if (!player) return;

    this._pausePlayer(player);
    player.waveform.style.setProperty('--progress', '0');
  };

  _getPlayerFromTrigger(trigger) {
    return this._players.find((player) => player.trigger === trigger);
  }

  _getPlayerFromAudio(audio) {
    return this._players.find((player) => player.audio === audio);
  }

  async _getWaveformHeights(audio) {
    const src = audio.currentSrc || audio.src;

    if (!src) return this._fallbackHeights();

    if (waveformCache.has(src)) return waveformCache.get(src);
    if (waveformPending.has(src)) return waveformPending.get(src);

    const request = this._loadWaveformHeights(audio, src);
    waveformPending.set(src, request);

    const heights = await request;
    waveformCache.set(src, heights);
    waveformPending.delete(src);

    return heights;
  }

  _loadWaveformHeights = async (audio, src) => {
    try {
      const response = await fetch(src, {
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) throw new Error('Failed to fetch audio');

      const audioBuffer = await this._getAudioContext().decodeAudioData(
        (await response.arrayBuffer()).slice(0),
      );

      return this._extractPeaks(audioBuffer.getChannelData(0));
    } catch {
      return this._fallbackHeights();
    }
  };

  _getAudioContext() {
    if (!sharedAudioContext) {
      sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    return sharedAudioContext;
  }

  _extractPeaks(channelData) {
    const samplesPerBar = Math.max(Math.floor(channelData.length / WAVEFORM_BAR_COUNT), 1);
    const peaks = [];

    for (let barIndex = 0; barIndex < WAVEFORM_BAR_COUNT; barIndex += 1) {
      const start = barIndex * samplesPerBar;
      let peak = 0;
      let sumSquares = 0;

      for (let sampleIndex = 0; sampleIndex < samplesPerBar; sampleIndex += 1) {
        const sample = channelData[start + sampleIndex] || 0;
        const abs = Math.abs(sample);

        if (abs > peak) peak = abs;
        sumSquares += sample * sample;
      }

      peaks.push(peak * 0.65 + Math.sqrt(sumSquares / samplesPerBar) * 0.35);
    }

    const sortedPeaks = [...peaks].sort((a, b) => a - b);
    const referencePeak = sortedPeaks[Math.floor(sortedPeaks.length * 0.92)] || 0.001;

    return peaks.map((peak) => {
      const normalized = Math.min(peak / referencePeak, 1);
      return MIN_BAR_HEIGHT + Math.pow(normalized, 0.75) * BAR_HEIGHT_RANGE;
    });
  }

  _fallbackHeights() {
    return Array.from({ length: WAVEFORM_BAR_COUNT }, (_, index) => {
      const wave = Math.sin((index / WAVEFORM_BAR_COUNT) * Math.PI * 3);
      return MIN_BAR_HEIGHT + Math.abs(wave) * BAR_HEIGHT_RANGE * 0.5;
    });
  }

  _buildWaveform(waveform, heights) {
    waveform.replaceChildren();
    waveform.style.setProperty('--progress', '0');

    const filledLayer = this._createBarLayer('sound-comparison__waveform-bars--filled', heights);
    const mutedLayer = filledLayer.cloneNode(true);

    mutedLayer.classList.replace(
      'sound-comparison__waveform-bars--filled',
      'sound-comparison__waveform-bars--muted',
    );

    waveform.append(mutedLayer, filledLayer);
  }

  _createBarLayer(layerClass, heights) {
    const layer = document.createElement('div');
    layer.className = `sound-comparison__waveform-bars ${layerClass}`;

    const fragment = document.createDocumentFragment();

    for (const height of heights) {
      const bar = document.createElement('span');
      bar.className = 'sound-comparison__waveform-bar';
      bar.style.setProperty('--bar-height', `${height}px`);
      fragment.appendChild(bar);
    }

    layer.appendChild(fragment);
    return layer;
  }

  async _playPlayer(player) {
    try {
      await player.audio.play();
      player.element.dataset.playing = 'true';
      this._setTriggerLabel(player, 'pause');
      this._startProgressLoop();
    } catch {
      player.element.dataset.playing = 'false';
      this._setTriggerLabel(player, 'play');
    }
  }

  _pausePlayer(player) {
    player.audio.pause();
    player.element.dataset.playing = 'false';
    this._setTriggerLabel(player, 'play');
    this._updateProgress(player);

    if (!this._hasPlayingPlayer()) {
      this._cancelProgressLoop();
    }
  }

  _pauseAllExcept(activeElement) {
    for (const player of this._players) {
      if (player.element === activeElement) continue;

      this._pausePlayer(player);
      player.waveform.style.setProperty('--progress', '0');
    }
  }

  _setTriggerLabel(player, state) {
    const label = state === 'pause' ? player.trigger.dataset.pauseLabel : player.trigger.dataset.playLabel;

    if (label) {
      player.trigger.setAttribute('aria-label', label);
    }
  }

  _updateProgress(player) {
    const { audio, waveform } = player;

    if (!audio.duration) return;

    const progress = Math.min(Math.max(audio.currentTime / audio.duration, 0), 1);
    waveform.style.setProperty('--progress', progress.toFixed(4));
  }

  _hasPlayingPlayer() {
    return this._players.some((player) => player.element.dataset.playing == 'true');
  }

  _startProgressLoop() {
    if (this._progressFrame) return;

    const tick = () => {
      for (const player of this._players) {
        if (player.element.dataset.playing == 'true') {
          this._updateProgress(player);
        }
      }

      if (!this._hasPlayingPlayer()) {
        this._progressFrame = null;
        return;
      }

      this._progressFrame = requestAnimationFrame(tick);
    };

    this._progressFrame = requestAnimationFrame(tick);
  }

  _cancelProgressLoop() {
    if (!this._progressFrame) return;

    cancelAnimationFrame(this._progressFrame);
    this._progressFrame = null;
  }
}

export default SoundComparison;
