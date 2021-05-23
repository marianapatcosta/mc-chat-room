const users = [];
const rooms = [];

const addUser = ({ id, username, room }) => {
    // clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => user.room === room && user.username === username)

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is already in use!'
        }
    }

    // Store user
    const user = { 
        id,
        username,
        room
    };

    users.push(user);

    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id);
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter(user => user.room === room);
}

const getRoomsInUse = () => {  
  users.forEach(user => {
      if (rooms.every(room => room !== user.room)) {
          rooms.push(user.room);
      }
  })
  return rooms;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRoomsInUse
}