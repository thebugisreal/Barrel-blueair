class QuickView extends HTMLElement {
  constructor() {
    super()
    this._onFocusableWidgetOpen = this.fetchProductContent.bind(this)
    this._onFocusableWidgetClose = () => {
      this.loadingEl.classList.remove('hidden')
      this.contentEl.innerHTML = ''
    }
    this._onQuickViewRender = (e) => this.renderProductContent(e.detail)
  }

  connectedCallback() {
    this.loadingEl = this.querySelector('[js-loading-indicator]')
    this.contentEl = this.querySelector('[js-quick-view-content]')
    document.addEventListener('focusable-widget:open', this._onFocusableWidgetOpen)
    document.addEventListener('focusable-widget:close', this._onFocusableWidgetClose)
    document.addEventListener('quick-view:render', this._onQuickViewRender)
  }

  async fetchProductContent(e) {
    const productUrl = e.detail.dataset.productUrl
    const xhrUrl = `${productUrl}${productUrl.includes('?') ? '&' : '?'}view=quick-view`
    const response = await fetch(xhrUrl).then((res) => res.text())
    const html = new DOMParser().parseFromString(response, 'text/html')

    this.renderProductContent(html)
  }

  renderProductContent(html) {
    const productElement = html.querySelector('[data-is-quick-view]')
    if (!productElement) return
    this.contentEl.innerHTML = ''
    this.loadingEl.classList.add('hidden')
    this.contentEl.appendChild(productElement)
  }

  disconnectedCallback() {
    document.removeEventListener('focusable-widget:open', this._onFocusableWidgetOpen)
    document.removeEventListener('focusable-widget:close', this._onFocusableWidgetClose)
    document.removeEventListener('quick-view:render', this._onQuickViewRender)
  }
}

export default QuickView