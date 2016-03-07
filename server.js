const http = require('http');
const express = require('express');
const app = express();
const socketIo = require('socket.io');
const twilio = require('twilio');
var client = new twilio.RestClient('AC9ea82f3d07b4471412ee445a10359da0',
                                   '07f215cababef9165a28f9e54aed3d4c');
var port = process.env.PORT || 3000;
var server = http.createServer(app);
var alwaysShowResults = false;
const io = socketIo(server);
var votes = {};
var poll = {
    question: 'Create a New Poll',
    choices: {
        choice1: 'Choice 1',
        choice2: 'Choice 2',
        choice3: 'Choice 3',
        choice4: 'Choice 4'
    }
};
var currentTimeout = null;
var pollEnded = false;

server.listen(port, function () { console.log('Listening on port ' + port); });

app.use(express.static('public'));
app.get('/', function (request, response) {
    response.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {
    var emitVoterCount = function () {
        io.sockets.emit('voteTotal', Object.keys(votes).length, io.engine.clientsCount);
    };

    var closePoll = function() {
        pollEnded = true;
        io.sockets.emit('closePollMessage');
        io.sockets.emit('voteCount', countVotes(votes));
    };

    io.sockets.emit('usersConnected', io.engine.clientsCount);
    socket.emit('newPollMessage', poll);
    socket.emit('statusMessage', 'You have connected.');
    emitVoterCount();
    if(alwaysShowResults) { io.sockets.emit('voteCount', countVotes(votes)); }
    if(pollEnded) { closePoll(); }

    socket.on('message', function (channel, message) {
        if (channel === 'voteCast') {
            votes[socket.id] = message;
            socket.emit('voteMessage', message);
            if(alwaysShowResults) {
                io.sockets.emit('voteCount', countVotes(votes));
            } else {
                Object.keys(votes).forEach(function(id) {
                    io.to(id).emit('voteCount', countVotes(votes))
                })
            }
            emitVoterCount();
        }
        if (channel === 'newPoll') {
            io.sockets.emit('closePoll');
            pollEnded = false;
            clearTimeout(currentTimeout);
            currentTimeout = null;
            io.sockets.emit('newPollMessage', message);
            votes = {};
            alwaysShowResults = message.alwaysShowResults;
            poll = {
                question: message.question,
                choices: {
                    choice1: message.choices.choice1,
                    choice2: message.choices.choice2,
                    choice3: message.choices.choice3,
                    choice4: message.choices.choice4
                }
            };

            if(message.duration) {
                var timeout = parseInt(message.duration) * 60 * 1000;
                currentTimeout = setTimeout(closePoll, timeout);
            }

            if(alwaysShowResults) {
                io.sockets.emit('voteCount', countVotes(votes));
            } else {
                socket.emit('voteCount', countVotes(votes));
            }
        }
        if (channel === 'closePoll') {
            closePoll();
            sendText();
        }
    });

    var sendText = function () {
        client.sms.messages.create({
            to: '+13035492649',
            from: '+17205230301',
            body: 'Poll is Over'
        }, function(error, message) {
            if (!error) {
                console.log('Success! The SID for this SMS message is:');
                console.log(message.sid);
                console.log('Message sent on:');
                console.log(message.dateCreated);
            } else {
                console.log('Oops! There was an error.');
            }
        });

    }


    socket.on('disconnect', function () {
        delete votes[socket.id];
        emitVoterCount();
        io.sockets.emit('usersConnected', io.engine.clientsCount);
    });
});

var countVotes = function (votes) {
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
};

module.exports = server;