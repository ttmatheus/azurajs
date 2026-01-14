/**
 * Debug test to understand the issue with param-only routes
 */

import { Router } from '../../package/src/infra/Router';

const router = new Router(true); // Enable debug

console.log('\n=== Adding routes ===');

// Add route starting with param
console.log('Adding route: GET /:id');
router.add('GET', '/:id', async (ctx: any) => {
  ctx.res.json({ id: ctx.req.params.id });
});

// Add normal route
console.log('Adding route: GET /users/:id');
router.add('GET', '/users/:id', async (ctx: any) => {
  ctx.res.json({ id: ctx.req.params.id });
});

console.log('\n=== Listing routes ===');
const routes = router.listRoutes();
console.log(routes);

console.log('\n=== Testing find ===');

try {
  console.log('\nFinding: GET /123');
  const result1 = router.find('GET', '/123');
  console.log('✓ Found:', result1);
} catch (e: any) {
  console.log('✗ Error:', e.message);
}

try {
  console.log('\nFinding: GET /users/456');
  const result2 = router.find('GET', '/users/456');
  console.log('✓ Found:', result2);
} catch (e: any) {
  console.log('✗ Error:', e.message);
}
