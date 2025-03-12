// FXMLHttpRequest.js
// Simulate XMLHttpRequest using the existing Network implementation

class FXMLHttpRequest {
    constructor() {
        this.readyState = 0; // 0: UNSENT
        this.status = 0;
        this.statusText = '';
        this.responseText = '';
        this.responseType = '';
        this.timeout = 0;
        this.withCredentials = false;
        this.method = null;
        this.url = null;
        this.async = true;
        this.headers = {};
        this.data = null;
        
        // Event handlers
        this.onreadystatechange = null;
        this.onload = null;
        this.onerror = null;
        this.ontimeout = null;
    }

    // Constants for readyState
    static get UNSENT() { return 0; }
    static get OPENED() { return 1; }
    static get HEADERS_RECEIVED() { return 2; }
    static get LOADING() { return 3; }
    static get DONE() { return 4; }

    open(method, url, async = true) {
        this.method = method;
        this.url = url;
        this.async = async;
        this.readyState = FXMLHttpRequest.OPENED;
        this._triggerStateChange();
    }

    setRequestHeader(name, value) {
        if (this.readyState !== FXMLHttpRequest.OPENED) {
            throw new Error('INVALID_STATE_ERR: setRequestHeader can only be called when readyState is OPENED');
        }
        this.headers[name] = value;
    }

    send(data = null) {
        if (this.readyState !== FXMLHttpRequest.OPENED) {
            throw new Error('INVALID_STATE_ERR: send can only be called when readyState is OPENED');
        }

        this.data = data;
        
        // Use the existing network instance
        window.networkInstance.sendRequest(this.method, this.url, this.data, (response) => {
            // Simulate headers received
            this.readyState = FXMLHttpRequest.HEADERS_RECEIVED;
            this._triggerStateChange();
            
            // Simulate loading
            this.readyState = FXMLHttpRequest.LOADING;
            this._triggerStateChange();
            
            // Process response
            this.status = response.status;
            this.statusText = response.message;
            this.responseText = JSON.stringify(response);
            
            // Request complete
            this.readyState = FXMLHttpRequest.DONE;
            this._triggerStateChange();
            
            if (this.onload && typeof this.onload === 'function') {
                this.onload();
            }
        });
    }

    abort() {
        this.readyState = FXMLHttpRequest.UNSENT;
        this.status = 0;
        this.statusText = '';
        this._triggerStateChange();
    }

    _triggerStateChange() {
        if (this.onreadystatechange && typeof this.onreadystatechange === 'function') {
            this.onreadystatechange();
        }
    }

    // Helper method to parse JSON response
    get response() {
        if (this.responseType === 'json' && this.responseText) {
            try {
                return JSON.parse(this.responseText);
            } catch (e) {
                return null;
            }
        }
        return this.responseText;
    }
}

// Add to window object
window.FXMLHttpRequest = FXMLHttpRequest;