const net = require('net');

const parser = require('./parser.js'); // 导入parser
const render = require('./render.js'); //
const images = require('images'); //

// http request class
class Request {
    // 收集必备的信息
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

    // 把真实请求发送到服务器，send函数是async，返回promise
    send(connection){
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser;
            if(connection){
                connection.write(this.toString());
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString());
                })
            }
            connection.on('data', (data) => {
                console.log(data.toString());
                parser.receive(data.toString());
                if (parser.isFinished) {
                    resolve(parser.response);
                    connection.end();
                }
            });
            connection.on('error', (err) => {
                reject(err);
                connection.end();
            });
        });
    }

    toString() {
        const CRLF = '\r\n';
        const request = [
            `${this.method} ${this.path} HTTP/1.1`,
            CRLF,
            `${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join(CRLF)}`,
            CRLF,
            CRLF,
            `${this.bodyText}`
        ];
        return request.join('');
    }
}

// response的body根据content-type有不同的结构，可使用子parser的结构来解决问题
class ResponseParser {
    constructor() {
        this.WAITING_STATUS_LINE = 0;
        this.WAITING_STATUS_LINE_END = 1;
        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6;
        this.WAITING_BODY = 7;

        this.current = this.WAITING_STATUS_LINE
        this.statusLine = "";
        this.headers = {}
        this.headersName = ""
        this.headersValue = ""
        this.bodyParser = null;
    }
    get isFinished(){
        return this.bodyParser && this.bodyParser.isFinished
    }

    get response(){
        this.statusLine.match(/HTTP\/1.2([0-9]+)([\s\S]+)/)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers:this.headers,
            body:this.bodyParser.content.join('')
        }
    }
    receive(string) {
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i))
        }
    }
    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE) { // current === 0
        if (char === '\r') { // ' ' 不匹配，HTTP/1.1 200 OK => 下一步匹配 '\r''\n'
            this.current = this.WAITING_STATUS_LINE_END
        } else {
            this.statusLine += char
        }
        } else if (this.current === this.WAITING_STATUS_LINE_END) { // current === 1
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME
            }
        } else if (this.current === this.WAITING_HEADER_NAME) { // current === 2
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE
        } else if (char === '\r') {
            this.current = this.WAITING_HEADER_BLOCK_END;
            // 当request的headers部分解析完毕后，就可以从操作bodyparser了
            if (this.headers['Transfer-Encoding'] === 'chunked') {
            // 创建新的类  参考：https://blog.csdn.net/Dancen/article/details/89957486
            this.bodyParser = new TrunkedBodyParser();
            }
        } else {
            this.headersName += char
        }
        } else if (this.current === this.WAITING_HEADER_SPACE) { // current === 3
            if (char === " ") {
                this.current = this.WAITING_HEADER_VALUE;
            }
        } else if (this.current === this.WAITING_HEADER_VALUE) { // current === 4
            if (char === "\r") {
                this.current = this.WAITING_HEADER_LINE_END;
                this.headers[this.headersName] = this.headerValue;
                this.headersName = "";
                this.headerValue = "";
            } else {
                this.headerValue += char;
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) { // current === 5
            if (char === "\n") {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_BLOCK_END) { // current === 6
            if (char === "\n") {
                this.current = this.WAITING_BODY;
            }
        } else if (this.current === this.WAITING_BODY) { // current === 7
            this.bodyParser.receiveChar(char);
        }
    }
}

// 用状态机处理body的格式
class TrunkedBodyParser {
    constructor() {
        this.WAITING_LENGTH = 0;
        this.WAITING_LENGTH_LINE_END = 1;
        this.READING_TRUNK = 2;
        this.WAITING_NEW_LINE = 3;
        this.WAITING_NEW_LINE_END = 4;
        this.length = 0;
        this.content = [];
        this.isFinished = false;
        this.current = this.WAITING_LENGTH;
    }

    receiveChar(char) {
        if (this.current === this.WAITING_LENGTH) {
            if (char === "\r") {
                if (this.length === 0) {
                    this.isFinished = true;
                }
                this.current = this.WAITING_LENGTH_LINE_END;
            } else {
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        } else if (this.current === this.WAITING_LENGTH_LINE_END) {
            if (char === "\n") {
                this.current = this.READING_TRUNK;
            }
        } else if (this.current === this.READING_TRUNK) {
            this.content.push(char);
            this.length--;
            if (this.length === 0) {
                this.current = this.WAITING_NEW_LINE;
            }
        } else if (this.current === this.WAITING_NEW_LINE) {
            if (char === "\r") {
                this.current = this.WAITING_NEW_LINE_END;
            }
        } else if (this.current === this.WAITING_NEW_LINE_END) {
            if (char === "\n") {
                this.current = this.WAITING_LENGTH;
            }
        }
    }
}
  

void async function () {
    let request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: 8088,
        path: '/',
        headers: {
            ["X-FOO2"]: "customed"
        },
        body: {
            name: 'jessie'
        }
    });

    // console.log(request);
    let response = await request.send();
    // console.log(response);

    // 把返回值通过parse变成一个dom树
    let dom = parser.parseHTML(response.body);
    // console.log(dom)

    // console.log(JSON.stringify(dom, null, "    "));

    // 创建视口
    let viewport = images(800, 600);
    // html -> body -> container -> c1
    render(viewport, dom.children[0].children[3].children[1].children[3]);
    viewport.save("viewport.jpg");
}();