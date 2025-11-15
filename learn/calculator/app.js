const http = require('http'); // Import the http module
const requestHandeler = require('./handler.js'); // Import the request handler
const server = http.createServer(requestHandeler); // Create the server

const PORT = 4000;

server.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});