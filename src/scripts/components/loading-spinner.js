/**
 * Loading Spinner Component
 * --------------------------------------------------------------------------------
 * @summary Self-contained scoped loader with style hooks. Container must have
 * position relative/absolute
 *
 * @usage <loading-spinner class="bg-black" style="--background: 'inherit';"></loading-spinner
 *
 * The loader accepts the following style hooks (and their defaults):
 *  --loading-color (#fff), --background ('inherit'), --bg-opacity (50%), --size (5rem)
 *
 * For the loader to show, add [loading] attribute to the component.
 */

class LoadingSpinner extends HTMLElement {
  constructor() {
    super();

    const html = `
    <style>
      :host {
        display: none;
        position: absolute;
        top: 0; right: 0; bottom: 0; left: 0;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
      }

      :host([loading]) {
        display: flex;
      }

      .background {
        position: absolute;
        top: 0; right: 0; bottom: 0; left: 0;
        width: 100%;
        height: 100%;
        background: var(--background, 'transparent');
        z-index: 1;
      }

      .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        width: var(--width, 20px);
        height: var(--height, 20px);
        color: var(--color, black);
        z-index: 2;
        animation: loading-spinner 1s linear infinite;
      }

      .loading-spinner svg{
        fill: currentColor;
        width: 100%;
      }

      @keyframes loading-spinner {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    </style>

    <div class="background"></div>
    <div class="loading-spinner">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 145 145">
        <path d="M72.5,145C32.6,145,.07,112.54,0,72.64H5c.07,37.14,30.35,67.36,67.5,67.36s67.5-30.28,67.5-67.5S109.72,5,72.5,5V0c39.98,0,72.5,32.52,72.5,72.5s-32.52,72.5-72.5,72.5Z" />
      </svg>
    </div>
    `

    const template = document.createElement('template');
    template.innerHTML = html;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }
}

export default LoadingSpinner;