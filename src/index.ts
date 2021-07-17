import fastify from 'fastify';
// @ts-expect-error No types for this package
import caching from 'fastify-caching';
import compress from 'fastify-compress';
import fastifyMultiPart from 'fastify-multipart';
import serve from 'fastify-static';
import fs from 'fs';
import marked from 'marked';
import path from 'path';
import { Database } from './utils/database';
import { createCodedFileName, createFileObject } from './utils/file';

const server = fastify();
const database = new Database('database/database');

server.register(fastifyMultiPart);
server.register(serve, {
  root: path.join(__dirname, '../', './database'),
});
server.register(caching);

server.register(compress, { global: true });

server.get('/', async (_req, res) => {
  const file = fs.readFileSync(path.join(__dirname, './welcome.md'), 'utf8');
  res.type('text/html');
  res.send(marked(file.toString()));
});

server.get('/ping', async () => {
  return 'Pong!';
});

server.post('/:store', async (req, res) => {
  const data = await req.file();
  const codedFileName = createCodedFileName(data.filename);
  const storeParam = (req.params as Record<string, string>).store;
  const codedFilePath = path.join(__dirname, '../', `./database${storeParam}/${codedFileName}`);
  const fileObject = createFileObject(codedFileName, codedFilePath);

  fs.openSync(codedFilePath, 'wx');
  fs.writeFileSync(codedFilePath, await data.toBuffer());

  database.set(`${storeParam}/${codedFileName}`, fileObject);

  res.send({ file: `${req.url}${storeParam}/${codedFileName}` });
});

server.listen(8080, (err: Error, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
