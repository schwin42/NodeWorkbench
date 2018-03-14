const http = require('http');

const homename = '127.0.0.1';
const ipname = '192.168.1.84'; //IP is dynamic, so this is very brittle.
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Old app\n');
});

// server.listen(port, homename, () => {
//   console.log(`Server running at http://${homename}:${port}/`);
// });

server.listen(port, ipname, () => {
  console.log(`Old server running at http://${ipname}:${port}/`);
});