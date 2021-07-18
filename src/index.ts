import fastify from 'fastify';
// @ts-expect-error No types for this package
import caching from 'fastify-caching';
import compress from 'fastify-compress';
import multiPart from 'fastify-multipart';
import serve from 'fastify-static';
import fs from 'fs';
import marked from 'marked';
import path from 'path';
import Fuse from 'fuse.js';
import { Database } from './utils/database';
import { createCodedFileName, createFileObject, File } from './utils/file';

const server = fastify();
const database = new Database('database/database');

server.register(multiPart);
server.register(serve, {
  root: path.join(__dirname, '../', './database'),
});
server.register(caching);
server.register(compress, { global: true });

const welcome = marked(fs.readFileSync(path.join(__dirname, './welcome.md'), 'utf8').toString());

server.get('/', async (_req, res) => {
  res.type('text/html');
  res.send(welcome);
});

server.get('/ping', async () => {
  return 'Pong!';
});

server.get('/:store', async (req, res) => {
  const params = req.params as Record<string, string>;
  const query = req.query as Record<string, string>;
  if (query.search) {
    const fuse = new Fuse(Object.keys(database.get(params.store) as unknown as File[]));
    res.send(fuse.search(query.search).map((results: any) => results.item));
  } else {
    res.send(Object.keys(database.get(params.store)));
  }
});

server.post('/:store', async (req, res) => {
  const parts = req.files();
  const payload = [];
  for await (const part of parts) {
    const codedFileName = createCodedFileName(part.filename);
    const storeParam = (req.params as Record<string, string>).store;
    if (!storeParam) {
      res.send({ error: 'Must have store parameter' });
      return;
    }
    const codedFilePath = path.join(__dirname, '../', `./database/${storeParam}/${codedFileName}`);
    const fileObject = createFileObject(codedFileName, codedFilePath);

    try {
      fs.openSync(codedFilePath, 'wx');
    } catch {
      fs.mkdir(path.join(__dirname, '../', `./database/${storeParam}`), (_err) => {
        res.send({ error: `Store: ${storeParam} already exists` });
        return;
      });
    }

    fs.writeFileSync(codedFilePath, await part.toBuffer());
    database.set(`${storeParam}/${codedFileName}`, fileObject);
    payload.push(`https://i.zephyr/${storeParam}/${codedFileName}`);
  }
  res.send(payload);
});

server.listen(8080, (err: Error, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
