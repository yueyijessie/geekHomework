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
                body div #myid{
                    width: 100px;
                    background-color: #ff5000;
                }
                body div img{
                    width:30px;
                    background-color: #ff1111;
                }
            </style>
        </head>
        <body>
                <div>
                    <img id="myid"/>
                    <img />
                </div>
        </body>
        </html>`
    );
});

server.listen(8088);
