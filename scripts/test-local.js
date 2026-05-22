const http = require('http');

http.get('http://localhost:3000/api/settings', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Status Code:', res.statusCode);
      console.log('Keys loaded successfully:', Object.keys(parsed));
      console.log('PersonalInfo Name:', parsed.personalInfo?.name);
      console.log('Languages count:', parsed.languages?.length);
      console.log('Skills count:', parsed.skills?.length);
      process.exit(0);
    } catch (e) {
      console.error('Parse error:', e.message);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('Fetch error:', err.message);
  process.exit(1);
});
