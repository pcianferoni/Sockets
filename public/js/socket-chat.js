var socket = io();

var params = new URLSearchParams(window.location.search);

if (!params.has('name') || !params.has('room')) {
    window.location = 'index.html';
    throw new Error('Name and room are required');
}

var user = {
    name: params.get('name'),
    room: params.get('room')
};



socket.on('connect', function() {
    console.log('Connected to the server');

    socket.emit('inChat', user, function(ans) {
        renderUsers(ans);
    });

});

socket.on('disconnect', function() {

    console.log('lost connection');

});


socket.on('createMessage', function(message) {
    renderMessages(message, false);
    scrollBottom();
});

// when users in/out the room
socket.on('personList', function(persons) {
    renderUsers(persons);
});

// dm
socket.on('directMessage', function(message) {

    console.log('Direct Message:', message);

});