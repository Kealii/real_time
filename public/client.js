var socket = io();
var connectionCount = document.getElementById('connection-count');
var buttons = document.querySelectorAll('#choices button');
var voteMessage = document.getElementById('vote-message');
var voteTally = document.getElementById('vote-tally');
var newPoll = document.getElementById('new-poll-form');
var newPollButton = document.getElementById('new-poll-button');
var endPollButton = document.getElementById('end-poll-button');
var voteCount = document.getElementById('vote-count');

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

socket.on('voteTotal', function (votes, userCount) {
    voteCount.innerText = votes + ' / ' + userCount
});

var showChoice = function(choiceId, choiceText) {
    var choice = document.getElementById(choiceId);
    if(choiceText) {
        choice.getElementsByTagName('span')[0].innerText = choiceText;
        choice.classList.remove('hide');
    } else {
        choice.classList.add('hide');
    }
}

socket.on('newPollMessage', function (message) {
    voteTally.innerText = ''
    var choices = document.getElementById('choices');
    var poll = document.getElementById('newPoll');
    if (message.question === null) {
        choices.classList.add('hide');
    } else {
        var newQuestion = document.getElementById('poll-question');
        newQuestion.innerText = message.question;

        showChoice('choiceText1', message.choices.choice1);
        showChoice('choiceText2', message.choices.choice2);
        showChoice('choiceText3', message.choices.choice3);
        showChoice('choiceText4', message.choices.choice4);

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
    var checkbox = document.getElementById('show-results').checked;
    socket.send('newPoll', { question: question,
                             choices: {
                                 choice1: choice1,
                                 choice2: choice2,
                                 choice3: choice3,
                                 choice4: choice4
                             },
                            alwaysShowResults: checkbox
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