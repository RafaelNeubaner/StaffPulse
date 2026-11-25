import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const host = '127.0.0.1';
const port = Number(process.env.PORT || 4173);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer(async (request, response) => {
  try {
    const requestedPath = new URL(request.url, `http://${request.headers.host}`).pathname;
    const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.slice(1);
    const filePath = path.resolve(projectRoot, relativePath);

    if (!filePath.startsWith(`${projectRoot}${path.sep}`)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    const content = await readFile(filePath);
    const contentType = contentTypes[path.extname(filePath)] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 500);
    response.end(error.code === 'ENOENT' ? 'Not found' : 'Internal server error');
  }
});

server.listen(port, host, () => {
  console.log(`StaffPulse disponível em http://${host}:${port}`);
});
