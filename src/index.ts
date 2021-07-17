import fastify from 'fastify';
import fastifyMultiPart from 'fastify-multipart';
import fs from 'fs';
import { pipeline } from 'stream';
import util from 'util';
import path from 'path';
import { createCodedFileName, createFileObject } from './utils/file';
import { Database } from './utils/database';

const pump = util.promisify(pipeline);
const server = fastify();
const database = new Database('store.json');
database.init();

server.register(fastifyMultiPart);

server.get('/ping', async () => {
  return 'Pong!';
});

server.post('/:store', async (req, res) => {
  const data = await req.file();
  const codedFileName = createCodedFileName(data.filename);
  const storeParam = (req.params as Record<string, string>).store;
  const codedFilePath = path.parse(`./store/${storeParam}/${codedFileName}`);
  const fileObject = createFileObject(codedFileName, codedFilePath.toString());
  await pump(data.file, fs.createWriteStream(codedFilePath.toString()));
  database.set(`${storeParam}.${codedFileName}`, fileObject);

  res.send(fileObject);
});

server.listen(8080, (err: Error, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
