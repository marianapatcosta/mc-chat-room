const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage, generateImageMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom, getRoomsInUse } = require('./utils/users');
const { CENSURED_WORDS } = require('./constants');

const app = express();
const server = http.createServer(app);
//socketio requires a raw http server, which express do behind but we are not able to get when we initiate express 'as usual'
const socketIo = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname , '../public');

app.use(express.static(publicDirectoryPath));

// connect is a built in event
socketIo.on('connection', socket => {
  // welcomeMessage is sent when a client connects; if we use io.emit() all the clients should get the unchanged welcomeMessage
  socket.emit('chatRooms', getRoomsInUse());

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Admin', 'Welcome!!!')); //emits event to a particular connections

    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined.`)
      ); // emits event to all the connections in a certain except a particular connections

    socketIo.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on('sendMessage', (sentMessage, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();
    filter.addWords(...CENSURED_WORDS);

    if (filter.isProfane(sentMessage)) {
      // socketIo.emit('message', filter.clean(sentMessage));
      return callback('Profanity is not allowed!');
    }

    socketIo.to(user.room).emit('message', generateMessage(user.username, sentMessage));
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);

    socketIo.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on('sendImage', (imageUrl) => {
    const user = getUser(socket.id);
    socketIo.to(user.room).emit('imageMessage', generateImageMessage(user.username, imageUrl));
  });

  //disconnect is a built in event
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      socketIo.to(user.room).emit('message',generateMessage('Admin', `${user.username} has left!`));
      socketIo.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
