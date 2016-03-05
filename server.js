const http = require('http');
const express = require('express');
const app = express();
const socketIo = require('socket.io');
var port = process.env.PORT || 3000;
var server = http.createServer(app);
var votes = {};
const io = socketIo(server);

function countVotes(votes) {
    var voteCount = {
        A: 0,
        B: 0,
        C: 0,
        D: 0
    };
    for (var vote in votes) {
        voteCount[votes[vote]]++
    }
    return voteCount;
}

server.listen(port, function () {
    console.log('Listening on port ' + port);
});

app.use(express.static('public'));

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {
    console.log('A user has connected.', io.engine.clientsCount);
    io.sockets.emit('usersConnected', io.engine.clientsCount);
    socket.emit('statusMessage', 'You have connected.');

    socket.on('message', function (channel, message) {
        if (channel === 'voteCast') {
            votes[socket.id] = message;
            socket.emit('voteMessage', message);
            socket.emit('voteCount', countVotes(votes));
        }
    });

    socket.on('disconnect', function () {
        console.log('A user has disconnected.', io.engine.clientsCount);
        delete votes[socket.id];
        console.log(votes);
        io.sockets.emit('usersConnected', io.engine.clientsCount);
    });
});

module.exports = server;