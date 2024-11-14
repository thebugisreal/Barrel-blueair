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

    this.video.addEventListener('click', this._videoOnClick);
    this.trigger.addEventListener('click', this._triggerOnClick);
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
    this.trigger.textContent = 'Pause';
    this.dataset.paused = 'false';
  }

  _pauseVideo = () => {
    this.video.pause();
    this.trigger.textContent = 'Play';
    this.dataset.paused = 'true';
  }
}