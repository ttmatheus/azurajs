import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

// GET /
app.get('/', (c) => c.text('Hello World'));

// GET /json
app.get('/json', (c) => c.json({ message: 'Hello World' }));

// POST /echo
app.post('/echo', async (c) => {
  const body = await c.req.json();
  return c.json(body);
});

// GET /user/:id
app.get('/user/:id', (c) => {
  return c.json({ id: c.req.param('id') });
});

// GET /query
app.get('/query', (c) => {
  const name = c.req.query('name') || 'Guest';
  return c.json({ name });
});

serve({
  fetch: app.fetch,
  port: 3002,
});

console.log('Hono server started on http://localhost:3002');
