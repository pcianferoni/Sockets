const { io } = require('../server');
const { Users } = require('../classes/users');
const { createMessage } = require('../utilities/utilities');
const users = new Users();

io.on('connection', (client) => {
    client.on('inChat', (data, callback) => {
        if (!data.name || !data.room) {
            return callback({
                error: true,
                message: 'Name/Room is required'
            });
        }
        client.join(data.room);
        users.addPerson(client.id, data.name, data.room);
        client.broadcast.to(data.room).emit('personList', users.getPersonsByRoom(data.room));
        client.broadcast.to(data.room).emit('createMessage', createMessage('Admin', `${ data.name } joined`));
        callback(users.getPersonsByRoom(data.room));
    });

    client.on('createMessage', (data, callback) => {
        let person = users.getPerson(client.id);
        let message = createMessage(person.name, data.message);
        client.broadcast.to(person.room).emit('createMessage', message);
        callback(message);
    });
    client.on('disconnect', () => {
        let deletePerson = users.deletePerson(client.id);
        client.broadcast.to(deletePerson.room).emit('createMessage', createMessage('Admin', `${ deletePerson.name } left`));
        client.broadcast.to(deletePerson.room).emit('personList', users.getPersonsByRoom(deletePerson.room));
    });
    // Direct Messages
    client.on('directMessage', data => {
        let person = users.getPerson(client.id);
        client.broadcast.to(data.para).emit('directMessage', createMessage(person.name, data.message));
    });

});