var socket = io();
var connectionCount = document.getElementById('connection-count');
var buttons = document.querySelectorAll('#choices button');
var voteMessage = document.getElementById('vote-message');
var voteTally = document.getElementById('vote-tally');

socket.on('usersConnected', function (count) {
    connectionCount.innerText = 'Connected Users: ' + count;
});

socket.on('voteCount', function (votes) {
    voteTally.innerText =  '  ' + votes['A'];
    voteTally.innerText += '  ' + votes['B'];
    voteTally.innerText += '  ' + votes['C'];
    voteTally.innerText += '  ' + votes['D'];
});

socket.on('voteMessage', function (vote) {
    voteMessage.innerText = 'Thanks for voting for ' + vote;
});

for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
        socket.send('voteCast', this.innerText);
    });
}