const http = require('http');
const fs = require('fs');

const homename = '127.0.0.1';
const ipname = '192.168.1.84'; //IP is dynamic, so this is very brittle.
const port = 3000;

const server = http.createServer((req, res) => {
    fs.readFile('index.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();

    });
  
  // res.statusCode = 200;
  // res.setHeader('Content-Type', 'text/plain');
  // res.end('Hello World\n');
});

// server.listen(port, homename, () => {
//   console.log(`Server running at http://${homename}:${port}/`);
// });

server.listen(port, ipname, () => {
  console.log(`Server running at http://${ipname}:${port}/`);
});