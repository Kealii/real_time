var socket = io();
var connectionCount = document.getElementById('connection-count');
var buttons = document.querySelectorAll('#choices button');
var voteMessage = document.getElementById('vote-message');
var voteTally = document.getElementById('vote-tally');
var newPoll = document.getElementById('newPollForm');

socket.on('usersConnected', function (count) {
    connectionCount.innerText = 'Connected Users: ' + count;
});

socket.on('voteCount', function (votes) {
    voteTally.innerText = votes['A'];
    voteTally.innerText += '   ' + votes['B'];
    voteTally.innerText += '   ' + votes['C'];
    voteTally.innerText += '   ' + votes['D'];
});

socket.on('voteMessage', function (vote) {
    voteMessage.innerText = 'Thanks for voting for ' + vote;
});

socket.on('newPollMessage', function (message) {
    var newQuestion = document.getElementById('poll-question');
    newQuestion.innerText = message.question;
    8
});

for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
        socket.send('voteCast', this.innerText);
    });
}

newPoll.addEventListener('submit', function (event) {
    var question = document.getElementById('question').value;
    socket.send('newPoll', {question: question});
    event.stopPropagation();
    event.preventDefault();
});