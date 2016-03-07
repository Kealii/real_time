var socket = io();
var connectionCount = document.getElementById('connection-count');
var buttons = document.querySelectorAll('#choices button');
var voteMessage = document.getElementById('vote-message');
var voteTally = document.getElementById('vote-tally');
var newPoll = document.getElementById('new-poll-form');
var newPollButton = document.getElementById('new-poll-button');
var endPollButton = document.getElementById('end-poll-button');

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
    var choices = document.getElementById('choices');
    var poll = document.getElementById('newPoll');
    if (message.question === null) {
        choices.classList.add('hide');
    } else {
        var newQuestion = document.getElementById('poll-question');
        var choice1 = document.getElementById('choiceText1');
        var choice2 = document.getElementById('choiceText2');
        var choice3 = document.getElementById('choiceText3');
        var choice4 = document.getElementById('choiceText4');
        newQuestion.innerText = message.question;
        choice1.innerText = message.choices.choice1;
        choice2.innerText = message.choices.choice2;
        choice3.innerText = message.choices.choice3;
        choice4.innerText = message.choices.choice4;
        poll.classList.add('hide');
        choices.classList.remove('hide');
    }
});

for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
        socket.send('voteCast', this.innerText);
    });
}

newPoll.addEventListener('submit', function (event) {
    var question = document.getElementById('question').value;
    var choice1 = document.getElementById('choice1').value;
    var choice2 = document.getElementById('choice2').value;
    var choice3 = document.getElementById('choice3').value;
    var choice4 = document.getElementById('choice4').value;
    socket.send('newPoll', { question: question,
                             choices: {
                                 choice1: choice1,
                                 choice2: choice2,
                                 choice3: choice3,
                                 choice4: choice4
                             }
                           });
    event.stopPropagation();
    event.preventDefault();
});

newPollButton.addEventListener('click', function () {
    var poll = document.getElementById('newPoll');
    poll.classList.toggle('hide');
});

endPollButton.addEventListener('click',function () {
    socket.send('closePoll');
});