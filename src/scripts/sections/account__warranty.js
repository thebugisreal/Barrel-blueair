class AccountWarranty extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
        this.netSuiteKey = '7qQudOp3GOK2nLK9'
        this.iframe = this.querySelector('iframe')
        this.iframeUrl = this.dataset.iframeUrl

        this.iframe.src = this.iframeUrl
        console.log('setnewSRC')
    }

    generateHex(str) {
        if(customer){
                //get Gigya ID of customer
                let customerExtID = 'custom' in customer.profile && 'gigya_UID' in customer.profile.custom ? customer.profile.custom['gigya_UID'] : null;
             
                if(customerExtID){
                    let unixBasedTimeString = Date.now().toString();
                    unixBasedTimeString = unixBasedTimeString.substr(0, unixBasedTimeString.length-7);
                    let stringToEncode = unixBasedTimeString + '' + customerExtID,
                        mc = new Mac(Mac.HMAC_SHA_256);
             
                    // secret = NetSuite Secret, endpointURL= NetSuite Endpoint URL
                    if(secret && endpointURL){
                        let encodedString = Encoding.toHex(mc.digest(stringToEncode, secret));
             
                        generatedSourceURL = endpointURL +'&hash='+encodedString + '&uid=' + customerExtID + '&country='+currentLocale.getCountry().toUpperCase() + '&locale=' + currentLocale.getID();
                    }
                }
            }
      }
  }