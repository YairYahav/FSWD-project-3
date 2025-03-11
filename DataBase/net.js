
import { Server } from "../server/server.js";

export class Network {

    constructor(/* dropProbability */) {

        


        this.server = new Server();
    }

    sendRequest(method, url, body, callback) { // like in the server handle

        






        if (Math.random() < this.dropProbability)
        {
            callback(this.server.Response(408, "Timeout"));
            return;
        }

        let delay = Math.floor(Math.random() * (this.maxDelay - this.minDelay) + this.minDelay);
        setTimeout(() => {
            console.log(`Network: Delivering request to the server after ${delay}ms`);
            
            // Pass response back to client through callback
            this.server.handleRequest(method, url, body, (response) => {
                // Simulate response loss
                if (Math.random() < this.dropProbability) {
                    console.log("response dropped");
                    callback(this.server.genResponse(500, "Internal Server Error: Response lost"));
                    return;
                }
                callback(response);
            });

        }, delay);
    }
}
