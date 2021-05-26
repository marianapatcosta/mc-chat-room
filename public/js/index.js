const socket = io();

// Elements
const $roomSelection = document.querySelector('#room-selection');
const room = document.getElementById('room');

// Templates
const roomSelectionTemplate = document.querySelector('#room-selection-template').innerHTML;

socket.on('chatRooms', (rooms) => {
  const html = Mustache.render(roomSelectionTemplate, {
    rooms
  });
  $roomSelection.innerHTML = html;
  const $selectElement = document.querySelector('#selected-room');
  $selectElement.disabled = !rooms.length ? true : false
});

function getSelectedRoom(event) {
   room.value = event.target.value
}
