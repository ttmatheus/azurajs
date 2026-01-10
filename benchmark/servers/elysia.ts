import { Elysia } from 'elysia';

const app = new Elysia()
  // GET /
  .get('/', () => 'Hello World')
  
  // GET /json
  .get('/json', () => ({ message: 'Hello World' }))
  
  // POST /echo
  .post('/echo', ({ body }) => body)
  
  // GET /user/:id
  .get('/user/:id', ({ params }) => ({ id: params.id }))
  
  // GET /query
  .get('/query', ({ query }) => ({ name: query.name || 'Guest' }))
  
  .listen(3001);

console.log('Elysia server started on http://localhost:3001');
