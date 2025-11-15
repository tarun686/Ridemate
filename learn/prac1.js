const http = require('http');

const server = http.createServer((req, res) => {
  console.log(req.url, req.method, req.headers);
  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<nav><a href="/">Home</a> | <a href="/men">Men</a> | <a href="/women">Women</a> | <a href="/kids">Kids</a> | <a href="/cart">Cart</a></nav>');
    return res.end();
  }
  if (req.url === '/men') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<h1>Welcome to Mens section</h1>');
    return res.end();
  } else if (req.url === '/women') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<h1>Welcome to Womens section</h1>');
    return res.end();
  } else if (req.url === '/kids') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<h1>Welcome to Kids section</h1>');
    return res.end();
  } else if (req.url === '/cart') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<h1>Your Cart is empty</h1>');
    return res.end();
  }
  res.setHeader('Content-Type', 'text/html');
  res.write('<h1>404 ERROR</h1>');
  res.end();
});

server.listen(3000, () => {
  console.log('Server is listening at http://localhost:3000');
});