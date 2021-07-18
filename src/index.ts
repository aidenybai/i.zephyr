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
import { createCodedFileName, createFileObject } from './utils/file';

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
    const fuse = new Fuse(Object.keys(database.get(params.store)));
    res.send(fuse.search(query.search).map((results: any) => results.item));
    return;
  }
  res.send(Object.keys(database.get(params.store)));
});

server.post('/:store', async (req, res) => {
  const parts = req.files();
  const payload = [];
  const params = req.params as Record<string, string>;
  for await (const part of parts) {
    const codedFileName = createCodedFileName(
      part.filename,
      !!(req.query as Record<string, string>).raw,
    );
    if (!params.store) {
      res.send({ error: 'Must have store parameter' });
      return;
    }
    const codedFilePath = path.join(
      __dirname,
      '../',
      `./database/${params.store}/${codedFileName}`,
    );
    const fileObject = createFileObject(codedFileName, codedFilePath);

    try {
      fs.openSync(codedFilePath, 'wx');
    } catch {
      fs.mkdir(path.join(__dirname, '../', `./database/${params.store}`), (_err) => {
        res.send({ error: `Store: ${params.store} already exists` });
        return;
      });
    }

    fs.writeFileSync(codedFilePath, await part.toBuffer());
    database.set(`${params.store}/${codedFileName}`, fileObject);
    payload.push(`https://i.zephyr/${params.store}/${codedFileName}`);
  }
  res.send(payload);
});

server.put('/:store/:file', async (req, res) => {
  const part = await req.file();
  const params = req.params as Record<string, string>;
  const payload = [];
  if (!params.store) {
    res.send({ error: 'Must have store parameter' });
    return;
  }
  const filePath = path.join(__dirname, '../', `./database/${params.store}/${params.file}`);
  const fileObject = createFileObject(params.file, filePath);

  fs.writeFileSync(filePath, await part.toBuffer());
  database.set(`${params.store}/${params.file}`, fileObject);
  payload.push(`https://i.zephyr/${params.store}/${params.file}`);
  res.send(payload);
});

server.delete('/:store/:file', async (req, res) => {
  const params = req.params as Record<string, string>;
  const payload = [];
  if (!params.store) {
    res.send({ error: 'Must have store parameter' });
    return;
  }
  const filePath = path.join(__dirname, '../', `./database/${params.store}/${params.file}`);

  fs.unlinkSync(filePath);
  payload.push(`https://i.zephyr/${params.store}/${params.file}`);
  res.send(payload);
});

server.listen(process.env.PORT || 8080, (err: Error, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
