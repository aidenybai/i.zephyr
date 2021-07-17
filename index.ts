import fastify from 'fastify';
import util from 'util';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import fastifyMultiPart from 'fastify-multipart';
const pump = util.promisify(pipeline);

const server = fastify()

server.register(fastifyMultiPart);

server.get('/ping', async (request, reply) => {
  return 'pong\n'
})

server.post('/', async (req, rep) => {
  const data = await req.file();
  await pump(data.file, fs.createWriteStream(data.filename));
  rep.send();
})

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
