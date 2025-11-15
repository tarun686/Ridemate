const http = require('http');
const fs = require('fs');
const server = http.createServer((req, res) => {
  console.log(req.url, req.method, req.headers);
  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<h1>Home Page</h1>'); 
    res.write('<form action ="/submit-details" method="POST"><input type="text" name="message"/><button type="submit">Send</button></form>');
  }
  else if (req.url .toLowerCase()=== '/submit-details' && req.method === 'POST') {
   fs.writeFileSync('message.txt', 'User submitted details');
   res.statusCode = 302;
   res.setHeader('Location', '/');
  }
  res.end();
});

server.listen(3000, () => {
  console.log('Server is listening at http://localhost:3000');
});