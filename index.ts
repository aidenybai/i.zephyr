import fastify from 'fastify';
import fastifyMultiPart from 'fastify-multipart';
import fs from 'fs';
import { pipeline } from 'stream';
import util from 'util';
import { v4 as uuid } from 'uuid';
const pump = util.promisify(pipeline);

const server = fastify();

server.register(fastifyMultiPart);

server.get('/ping', async () => {
  return 'Pong!';
});

server.post('/', async (req, rep) => {
  const data = await req.file();
  await pump(data.file, fs.createWriteStream(uuid()));
  rep.send();
});

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
