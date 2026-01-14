/**
 * Simple test for param-only routes
 */

const { AzuraClient } = require('../../package/src/infra/Server');

const app = new AzuraClient();

console.log('\n=== Registering routes ===');

// Test GET with param only
app.get('/:id', (req, res) => {
  console.log('Handler called for /:id');
  console.log('Params:', req.params);
  res.json({ route: '/:id', id: req.params.id });
});

// Test POST with param only (to compare with GET)
app.post('/:id', (req, res) => {
  console.log('Handler called for POST /:id');
  res.json({ route: 'POST /:id', id: req.params.id });
});

// Test normal route
app.get('/users/:id', (req, res) => {
  res.json({ route: '/users/:id', id: req.params.id });
});

console.log('\n=== Routes registered ===');
const routes = app.getRoutes();
console.log(routes);

app.listen(3001).then(() => {
  console.log('\n✅ Server running on http://localhost:3001');
  console.log('\nTest these:');
  console.log('  curl http://localhost:3001/123');
  console.log('  curl -X POST http://localhost:3001/456');
  console.log('  curl http://localhost:3001/users/789\n');
});
