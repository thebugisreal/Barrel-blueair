class Video extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      video: 'video',
      trigger: '[js-video-trigger]'
    }
  }

  connectedCallback() {
    this.video = this.querySelector(this._selectors.video);
    this.trigger = this.querySelector(this._selectors.trigger);

    this.trigger.addEventListener('click', this._triggerOnClick);
    if (this.dataset.controls == 'false') {
      this.video.addEventListener('click', this._videoOnClick);
    }
  }

  _videoOnClick = () => {
    if (this.dataset.paused == 'true') {
      return;
    }

    this._pauseVideo();
  }

  _triggerOnClick = () => {
    if (this.dataset.paused == 'true') {
      this._playVideo();
    } else {
      this._pauseVideo();
    }
  }

  _playVideo = () => {
    this.video.play();
    if (this.dataset.controls == 'true') {
      this.video.setAttribute('controls', 'controls');
    }
    if (this.trigger.dataset.text == 'true') {
      this.trigger.textContent = 'Pause';
    }
    this.dataset.paused = 'false';
  }

  _pauseVideo = () => {
    this.video.pause();
    if (this.trigger.dataset.text == 'true') {
      this.trigger.textContent = 'Play';
    }
    this.dataset.paused = 'true';
  }
}