const http = require('http');
const express = require('express');
const app = express();
const socketIo = require('socket.io');
var port = process.env.PORT || 3000;
var server = http.createServer(app);
const io = socketIo(server);
var votes = {};
var poll = {question: 'Create a New Poll',
            choices: {
                choice1: 'Choice 1',
                choice2: 'Choice 2',
                choice3: 'Choice 3',
                choice4: 'Choice 4'
            }};

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
    socket.emit('newPollMessage', poll);
    socket.emit('statusMessage', 'You have connected.');

    socket.on('message', function (channel, message) {
        console.log(channel);
        if (channel === 'voteCast') {
            votes[socket.id] = message;
            socket.emit('voteMessage', message);
            socket.emit('voteCount', countVotes(votes));
        }
        if (channel === 'newPoll') {
            io.sockets.emit('newPollMessage', message);
            poll = {question: message.question,
                    choices: {
                        choice1: message.choices.choice1,
                        choice2: message.choices.choice2,
                        choice3: message.choices.choice3,
                        choice4: message.choices.choice4
                    }};
        }
        if (channel === 'closePoll') {
            poll = {question: null,
                    choices: null};
            io.sockets.emit('newPollMessage', poll);
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