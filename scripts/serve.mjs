import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
const root = resolve('dist');
const port = Number(process.env.PORT || 4174);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.txt':'text/plain','.xml':'application/xml'};
const server = createServer(async (req,res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = resolve(file,'index.html');
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
    res.end(await readFile(resolve(root,'404.html')).catch(() => 'Build first: npm run build'));
  }
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://localhost:${port}`));
