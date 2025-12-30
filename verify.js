const http = require('http');

const url = 'http://localhost:5201/proxy?url=https%3A%2F%2Fpwdatabase.ru%2Fitems%2F65914';

http.get(url, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Body length:', data.length);
    console.log('Body preview:', data.substring(0, 100));
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});
