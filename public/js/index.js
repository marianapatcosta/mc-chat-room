const socket = io();

// Elements
const $selectElement = document.querySelector('#selected-room');
const room = document.getElementById('room');

socket.on('chatRooms', (rooms) => {
  const placeholder = document.createElement("option");
  placeholder.innerText = 'Select an existing room';
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.hidden = true;
  placeholder.value = '';
  $selectElement.append(placeholder);
  for (const room of rooms) {
    const element = document.createElement("option");
    element.innerText = room;
    element.value = room;
    $selectElement.append(element);
  }
  $selectElement.disabled = !rooms.length ? true : false
});

const getSelectedRoom = (event) => room.value = event.target.value;
