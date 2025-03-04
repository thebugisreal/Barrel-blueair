class AccountWarranty extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
        this.iframe = this.querySelector('iframe')
        this.iframeUrl = new URL(this.dataset.iframeUrl)
        this.token = this.dataset.token

        // Generate Hex
        const newHex = this.generateHex(this.token)
        this.iframeUrl.searchParams.set('hash', this.token)


        this.iframe.src = this.iframeUrl
    }

    generateHex(token) {
      return token.hexEncode()
    }
  }

  String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}

/* 

Testing URL
https://acct66616-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=2116&deploy=1&compid=ACCT66616_SB1&ns-at=AAEJ7tMQ6VEe57V0dXTUAijVfZnZV92jG3X44uZO-EO-hBEcA5M&uid=6139e556bf5942b5b065452cbf0ed482&country=US&locale=en_US&hash=function%28%29%7Bvar+hex%2Ci%2Cresult%3D%22%22%3Bfor%28i%3D0%3Bi%3Cthis.length%3Bi%2B%2B%29hex%3Dthis.charCodeAt%28i%29.toString%2816%29%2Cresult%2B%3D%28%22000%22%2Bhex%29.slice%28-4%29%3Breturn+result%7D

My URL
https://acct66616.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=2116&deploy=1&compid=ACCT66616_SB1&ns-at=AAEJ7tMQ6VEe57V0dXTUAijVfZnZV92jG3X44uZO-EO-hBEcA5M&uid=6139e556bf5942b5b065452cbf0ed482&country=US&locale=en_US&hash=dfb47749c26ccafc1ba637d7d4f2122e0a2364f323ad5cf94306149e9d6abc4e

Live URL
https://acct66616.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1319&deploy=1&compid=ACCT66616&h=53fbcd516ebe5428a762&ns-at=AAEJ7tMQs5kFMj85g1G5XX-UFYv3SfIy2IniVgrunpQSEm9E-Q0&hash=ebcda0aa2a186e24040900ed92bbffa1f1692965f8cb99e127cde4b6637debb3&uid=f89b6cb588c744ccbffcd6dff86a2d48&country=US&locale=en_US

New Test URL
https://acct66616-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1319&deploy=1&compid=ACCT66616&ns-at=AAEJ7tMQs5kFMj85g1G5XX-UFYv3SfIy2IniVgrunpQSEm9E-Q0&hash=ebcda0aa2a186e24040900ed92bbffa1f1692965f8cb99e127cde4b6637debb3&uid=6139e556bf5942b5b065452cbf0ed482&country=US&locale=en_US

*/