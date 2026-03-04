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
    if (this.dataset.playing == 'false') {
      return;
    }

    this._pauseVideo();
  }

  _triggerOnClick = () => {
    if (this.dataset.playing == 'false') {
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
    this.dataset.playing = 'true';
  }

  _pauseVideo = () => {
    this.video.pause();
    this.dataset.playing = 'false';
  }
}

export default Video;