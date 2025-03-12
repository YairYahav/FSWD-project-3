// requestUtils.js - Utilities for making HTTP requests with FXMLHttpRequest

// Helper function for making requests with FXMLHttpRequest
function makeRequest(method, url, data = null) {
    return new Promise((resolve, reject) => {
        const xhr = new FXMLHttpRequest();
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === FXMLHttpRequest.DONE) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(response);
                    } else {
                        reject(new Error(response.message || 'Request failed'));
                    }
                } catch (e) {
                    reject(new Error('Failed to parse response'));
                }
            }
        };
        
        xhr.open(method, url);
        
        if (data) {
            if (typeof data === 'object') {
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send(data);
            }
        } else {
            xhr.send();
        }
    });
}

// Convenience methods for common HTTP methods
const RequestUtil = {
    get: (url) => makeRequest('GET', url),
    
    post: (url, data) => makeRequest('POST', url, data),
    
    put: (url, data) => makeRequest('PUT', url, data),
    
    delete: (url) => makeRequest('DELETE', url),
    
    // Compatibility with the existing ajax function
    ajax: (method, url, data, successCallback, errorCallback) => {
        makeRequest(method, url, data)
            .then(response => {
                if (successCallback) successCallback(response);
            })
            .catch(error => {
                if (errorCallback) errorCallback(error);
            });
    }
};

// Export to window
window.RequestUtil = RequestUtil;