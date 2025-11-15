const {sumrequest} = require('./sum');
const requestHandler = (req, res) => {
  console.log(req.url, req.method);
  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<h1>Welcome to Calculator Home Page</h1>');
    res.write('<a href="/calculator">Go to calci</a>');
    return res.end();
  }
  else if(req.url === '/calculator' && req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<form action="/calculator-result" method="POST">');
    res.write('<input type="number" name="num1" placeholder="Enter first number" required/>');
    res.write('<input type="number" name="num2" placeholder="Enter second number" required/>');
    res.write('<button type="submit">Calculate Sum</button>');
    res.write('</form>');
    return res.end();

  }
  else if(req.url === '/calculator-result' && req.method === 'POST') {
   
    return sumrequest(req, res);
  }
  else
  {
    res.setHeader('Content-Type', 'text/html');
    res.write("404 Page Not Found");
    res.write('<br><a href="/">Go to Home</a>');
    return res.end();
  }
};

module.exports = requestHandler;