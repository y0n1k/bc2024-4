const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { Command } = require('commander');
const program = new Command();
program
.requiredOption('-h, --host <host>', 'Server host')
.requiredOption('-p, --port <port>', 'Server port')
.requiredOption('-c, --cache <path>', 'Cache directory path');
program.parse(process.argv);
const { host, port, cache } = program.opts();
console.log(`Host: ${host}`);
console.log(`Port: ${port}`);
console.log(`Cache directory: ${cache}`);
const server = http.createServer(async (req, res) => {
const urlParts = req.url.split('/');
const httpCode = urlParts[1];
const filePath = path.join(cache, `${httpCode}.jpg`);
if (req.method === 'GET') {
try {
const image = await fs.readFile(filePath);
res.writeHead(200, { 'Content-Type': 'image/jpeg' });
res.end(image);
} catch (error) {
if (error.code === 'ENOENT') {
res.writeHead(404, { 'Content-Type': 'text/plain' });
res.end('Not Found');
} else {
res.writeHead(500, { 'Content-Type': 'text/plain' });
res.end('Internal Server Error');
}
}
} else if (req.method === 'PUT') {
let body = [];
req.on('data', chunk => body.push(chunk));
req.on('end', async () => {
try {
await fs.writeFile(filePath, Buffer.concat(body));
res.writeHead(201, { 'Content-Type': 'text/plain' });
res.end('Created');
} catch (error) {
res.writeHead(500, { 'Content-Type': 'text/plain' });
res.end('Internal Server Error');
}
});
} else {
res.writeHead(405, { 'Content-Type': 'text/plain' });
res.end('Method Not Allowed');
}
});
server.listen(port, host, () => {
console.log(`http://${host}:${port}/`);
});