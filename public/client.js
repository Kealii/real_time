var socket = io();
var buttons         = document.querySelectorAll('#choices button');
var voteTally       = document.getElementById('vote-tally');
var poll            = document.getElementById('new-poll');
var newPollForm     = document.getElementById('new-poll-form');
var newPollButton   = document.getElementById('new-poll-button');
var endPollButton   = document.getElementById('end-poll-button');
var choices         = document.getElementById('choices');
var voteMessage     = document.getElementById('vote-message');
var connectionCount = document.getElementById('connection-count');
var voteCount       = document.getElementById('vote-count');
var newQuestion     = document.getElementById('poll-question');

socket.on('usersConnected', function (count) {
    connectionCount.innerText = 'Connected Users: ' + count;
});

socket.on('voteCount', function (votes) {
    voteResults(votes);
});

socket.on('voteMessage', function (vote) {
    voteMessage.innerText = 'Thanks for voting for ' + vote;
});

socket.on('voteTotal', function (votes, userCount) {
    voteCount.innerText = votes + ' / ' + userCount
});

socket.on('newPollMessage', function (message) {
    showButtons();
    resetVotes();
    resetVoteMessage();
    if (message.question === null) {
        choices.classList.add('hide');
    } else {
        newQuestion.innerText = message.question;
        showChoice('choiceText1', message.choices.choice1);
        showChoice('choiceText2', message.choices.choice2);
        showChoice('choiceText3', message.choices.choice3);
        showChoice('choiceText4', message.choices.choice4);
        hidePoll();
        choices.classList.remove('hide');
    }
});

socket.on('closePollMessage', function () {
    hideButtons();
});

newPollForm.addEventListener('submit', function (event) {
    var question, choice1, choice2, choice3, choice4, duration, checkbox;
    question = event.target.question.value;
    choice1  = event.target.choice1.value;
    choice2  = event.target.choice2.value;
    choice3  = event.target.choice3.value;
    choice4  = event.target.choice4.value;
    duration = event.target['poll-duration'].value;
    checkbox = event.target['show-results'].checked;
    socket.send('newPoll', { question: question,
                             choices: {
                                 choice1: choice1,
                                 choice2: choice2,
                                 choice3: choice3,
                                 choice4: choice4
                             },
                             duration: duration,
                             alwaysShowResults: checkbox
                           });
    event.stopPropagation();
    event.preventDefault();
});

newPollButton.addEventListener('click', function () {
    poll.classList.toggle('hide');
});

endPollButton.addEventListener('click', function () {
    socket.send('closePoll');
});

var hidePoll = function () {
    poll.classList.add('hide');
};

var showButtons = function () {
    for(var i=0; i < buttons.length;i++) {
        buttons[i].classList.remove('hide');
    }
};

var hideButtons = function () {
    for(var i = 0; i < buttons.length; i++) {
        buttons[i].classList.add('hide');
    }
};

var voteResults = function (votes) {
    voteTally.innerText = 'A: ' + votes['A'];
    voteTally.innerText += '  B: ' + votes['B'];
    voteTally.innerText += '  C: ' + votes['C'];
    voteTally.innerText += '  D: ' + votes['D'];
};

var resetVotes = function () {
    voteTally.innerText = '';
};

var resetVoteMessage = function () {
    voteMessage.innerText = null;
};

var showChoice = function (choiceId, choiceText) {
    var choice = document.getElementById(choiceId);
    if(choiceText) {
        choice.getElementsByTagName('span')[0].innerText = choiceText;
        choice.classList.remove('hide');
    } else {
        choice.classList.add('hide');
    }
};

for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
        socket.send('voteCast', this.innerText);
    });
}