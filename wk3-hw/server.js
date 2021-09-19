const http = require('http');

const server = http.createServer((request, response) => {
    console.log('request received');
    console.log(request.headers);
    response.setHeader('Content-Type', 'text/html');
    response.setHeader('X-Foo', 'bar');
    response.writeHead(200, {'content-Type': 'text/plain'});
    response.end(
        `<html maaa=a >
        <head>
            <style>
                #container {
                    width: 500px;
                    height:300px;
                    display:flex;
                }
                #container #myid {
                    width: 200px;
                }
                #container .c1 {
                    flex:1;
                }
            </style>
        </head>
        <body>
                <div id="container">
                    <div id="myid"/>
                    <div class="c1" />
                </div>
        </body>
        </html>`
    );
});

server.listen(8088);
