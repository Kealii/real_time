const http = require('http');
const express = require('express');
const app = express();

var port = process.env.PORT || 3000;
var server = http.createServer(app);

server.listen(port, function () {
    console.log('Listening on port ' + port);
});

app.use(express.static('public'));

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/public/index.html');
});

module.exports = server;