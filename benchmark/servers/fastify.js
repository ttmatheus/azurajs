import Fastify from 'fastify';

const fastify = Fastify({
  logger: false
});

// GET /
fastify.get('/', async (request, reply) => {
  return 'Hello World';
});

// GET /json
fastify.get('/json', async (request, reply) => {
  return { message: 'Hello World' };
});

// POST /echo
fastify.post('/echo', async (request, reply) => {
  return request.body;
});

// GET /user/:id
fastify.get('/user/:id', async (request, reply) => {
  return { id: request.params.id };
});

// GET /query
fastify.get('/query', async (request, reply) => {
  return { name: request.query.name || 'Guest' };
});

try {
  await fastify.listen({ port: 3003 });
  console.log('Fastify server started on http://localhost:3003');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
