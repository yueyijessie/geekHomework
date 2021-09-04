const net = require('net');

// http request class
class Request {
    constructor(options) {
        // set default value
        this.method = options.method || 'GET';
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || '/';
        this.body = options.body || {}; // body is KV
        this.headers = options.headers || {};
        // http must have Content-Type, set default value
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        // different content-type have different body types
        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body);
        } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
        }
        //
        this.headers['Content-Length'] = this.bodyText.length;
    }

    send(){
        return new Promise((resolve, reject) => {
            // ...
        });
    }
}


void async function () {
    let request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: '8088',
        path: '/',
        headers: {
            ["X-Foo2"]: "customed"
        },
        body: {
            name: 'jessie'
        }
    });

    let response = await request.send();

    console.log(response);
}