const sumrequest =  (req, res) => {
  console.log("helo");
  const body=[];
  req.on('data', (chunk) => { body.push(chunk);})
  req.on('end', ()=> {
    
    const bodys= Buffer.concat(body).toString();
    const parsedbody = new URLSearchParams(bodys);
    const bodyobj=Object.fromEntries(parsedbody);
    console.log(bodyobj);
    const num1 = Number(bodyobj.num1);
    const num2 = Number(bodyobj.num2);
    const sum = num1 + num2;
    res.setHeader('Content-Type', 'text/html');
    res.write(`<h1>Sum of ${num1} and ${num2} is ${sum}</h1>`);
    res.end();
  })
}

exports.sumrequest = sumrequest;