/**
 * Quick test for IP resolution
 * Run this file and access http://localhost:3000 to check if req.ip works
 */

import { AzuraClient } from '../../package/src/infra/Server';

const app = new AzuraClient();

app.get('/', (req, res) => {
  const result = {
    status: req.ip ? '✅ SUCCESS' : '❌ FAILED',
    ip: req.ip || 'EMPTY/UNDEFINED',
    ips: req.ips || [],
    rawHeaders: {
      'x-forwarded-for': req.get('x-forwarded-for'),
      'x-real-ip': req.get('x-real-ip'),
      'host': req.get('host'),
    },
    socketAddress: (req.socket as any)?.remoteAddress || 'N/A',
    config: {
      trustProxy: app.getConfig().server?.trustProxy || false,
      ipHeader: app.getConfig().server?.ipHeader || 'x-forwarded-for',
    },
    troubleshooting: req.ip ? 
      '🎉 IP is working correctly!' : 
      '⚠️ Check your azura.config.ts and set trustProxy if behind a proxy/load balancer'
  };

  console.log('\n📊 IP Resolution Test Results:');
  console.log(JSON.stringify(result, null, 2));
  
  res.json(result);
});

app.listen(3000).then(() => {
  console.log('\n🧪 IP Resolution Test Server');
  console.log('📍 Visit: http://localhost:3000');
  console.log('💡 Check console for detailed output\n');
});
