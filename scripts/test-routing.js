const http = require('http');

function checkRoute(path, expectedStatus, expectedType, testName) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const statusOk = res.statusCode === expectedStatus;
        const contentType = res.headers['content-type'] || '';
        const typeOk = contentType.includes(expectedType);
        
        if (statusOk && typeOk) {
          console.log(`[PASS] ${testName} (${path})`);
          resolve(true);
        } else {
          console.error(`[FAIL] ${testName} (${path})`);
          console.error(`       Expected: Status ${expectedStatus}, Type ${expectedType}`);
          console.error(`       Received: Status ${res.statusCode}, Type ${contentType}`);
          console.error(`       Body: ${data.slice(0, 100)}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.error(`[FAIL] ${testName} (${path}) - Request failed: ${err.message}`);
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('Starting routing verification...');
  let allPassed = true;

  const tests = [
    { path: '/', expectedStatus: 200, expectedType: 'text/html', name: 'Home Page' },
    { path: '/robots.txt', expectedStatus: 200, expectedType: 'text/plain', name: 'robots.txt' },
    { path: '/sitemap.xml', expectedStatus: 200, expectedType: 'application/xml', name: 'sitemap.xml' },
    { path: '/api/settings', expectedStatus: 200, expectedType: 'application/json', name: 'API Settings' },
    { path: '/api/nonexistent', expectedStatus: 404, expectedType: 'application/json', name: 'API NotFound Fallback' },
    { path: '/missing.css', expectedStatus: 404, expectedType: 'text/html', name: 'Missing Static File' },
    { path: '/some-custom-route-for-spa', expectedStatus: 200, expectedType: 'text/html', name: 'SPA Page Fallback' }
  ];

  for (const t of tests) {
    const passed = await checkRoute(t.path, t.expectedStatus, t.expectedType, t.name);
    if (!passed) allPassed = false;
  }

  if (allPassed) {
    console.log('\nAll verification tests PASSED successfully!');
    process.exit(0);
  } else {
    console.error('\nVerification tests FAILED!');
    process.exit(1);
  }
}

runTests();
