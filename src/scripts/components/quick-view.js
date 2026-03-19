class QuickView extends HTMLElement {
  constructor() {
    super()
    this._onFocusableWidgetOpen = this.renderProductContent.bind(this)
    this._onFocusableWidgetClose = () => {
      this.loadingEl.classList.remove('hidden')
      this.contentEl.innerHTML = ''
    }
  }

  connectedCallback() {
    this.loadingEl = this.querySelector('[js-loading-indicator]')
    this.contentEl = this.querySelector('[js-quick-view-content]')
    document.addEventListener('focusable-widget:open', this._onFocusableWidgetOpen)
    document.addEventListener('focusable-widget:close', this._onFocusableWidgetClose)
  }

  async renderProductContent(e) {
    const productUrl = e.detail.dataset.productUrl
    const xhrUrl = `${productUrl}${productUrl.includes('?') ? '&' : '?'}view=quick-view`
    const response = await fetch(xhrUrl).then((res) => res.text())
    const doc = new DOMParser().parseFromString(response, 'text/html')
    const productElement = doc.querySelector('[data-is-quick-view]')

    if (!productElement) return

    this.loadingEl.classList.add('hidden')
    this.contentEl.appendChild(productElement)
  }

  disconnectedCallback() {
    document.removeEventListener('focusable-widget:open', this._onFocusableWidgetOpen)
    document.removeEventListener('focusable-widget:close', this._onFocusableWidgetClose)
  }
}

export default QuickView