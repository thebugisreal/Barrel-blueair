class AccountWarranty extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
        this.netSuiteKey = '7qQudOp3GOK2nLK9'
        this.gigyaId = '6139e556bf5942b5b065452cbf0ed482'
        this.iframe = this.querySelector('iframe')
        this.iframeUrl = new URL(this.dataset.iframeUrl)

        // Generate Hex
        const newHex = this.generateHex(this.gigyaId )
        this.iframeUrl.searchParams.set('hash', newHex)

        this.iframe.src = this.iframeUrl
    }

    generateHex(gigyaId) {
        let unixBasedTimeString = Date.now().toString();
        let stringToEncode = unixBasedTimeString + '' + gigyaId
        let mc = new Mac(Mac.HMAC_SHA_256);
        let encodedString = Encoding.toHex(mc.digest(stringToEncode, this.netSuiteKey));
        return encodedString
    }
  }