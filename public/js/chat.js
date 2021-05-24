const socket = io();
const alertSound = new Audio('../sounds/alert.mp3');

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $uploadButton = document.querySelector('#upload');
const $recordButton = document.querySelector('#record');
const $uploadInput = document.querySelector('#upload-input');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');
let $imageMessages;
const IMAGE_FILE_TYPES = {
  GIF: '.gif',
  JPEG: '.jpeg',
  JPG: '.jpg',
  PNG: '.png',
  SVG: '.svg',
};

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
  '#location-message-template'
).innerHTML;
const imageMessageTemplate = document.querySelector(
  '#image-message-template'
).innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } =
  location.search.split('&').length === 2 &&
  location.search.split('&')[0].includes('username') &&
  location.search.split('&')[1].includes('room')
    ? Qs.parse(location.search, {
        ignoreQueryPrefix: true
      })
    : (location.href = '/') && alert('Invalid Parameters!');

// helper methods 
const handleImageMessages = () => {
  $imageMessages = document.getElementsByClassName('message__image');
  const newImageElement = $imageMessages[$imageMessages.length -1];
  newImageElement.addEventListener('click', () => {
    if (newImageElement.classList.contains('message__image--zoomed')) {
      return newImageElement.classList.remove('message__image--zoomed');
    }
    newImageElement.classList.add('message__image--zoomed');
  });
};

const handleInsertHtml = (html, isSender) => {
  $messages.insertAdjacentHTML('beforeend', html);
  $messages.lastElementChild.scrollIntoView(false)
  if (!isSender) {
    alertSound.play();
  }
}

// socket handlers

socket.on('message', message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
    isSentMessage: username === message.username
  });
  handleInsertHtml(html, username === message.username);
});

socket.on('locationMessage', location => {
  const html = Mustache.render(locationMessageTemplate, {
    username: location.username,
    myCurrentLocation: location.locationUrl,
    createdAt: moment(location.createdAt).format('h:mm a'),
    isSentMessage: username === location.username
  });
  handleInsertHtml(html, username === message.username);
});

socket.on('imageMessage', message => {
  const html = Mustache.render(imageMessageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
    isSentMessage: username === message.username,
    imageSrc: message.imageSrc
  });
  handleInsertHtml(html, username === message.username);
  handleImageMessages();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  $sidebar.innerHTML = html;
});

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

// listeners

$messageForm.addEventListener('submit', event => {
  event.preventDefault();
  $messageButton.setAttribute('disabled', 'disabled');
  const sentMessage = event.target.elements.message.value;
  socket.emit('sendMessage', sentMessage, error => {
    //re-enable the form
    $messageButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return alert(error);
    }
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser!');
  }

  $sendLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(
    position => {
      socket.emit(
        'sendLocation',
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        () => {
          $sendLocationButton.removeAttribute('disabled');
        }
      );
    },
    error => {
      alert('Location not found!');
    },
    { timeout: 10000 }
  );
});

$uploadButton.addEventListener('click', () => {
  $uploadInput.click()
});

$uploadInput.addEventListener('change', (event) => {
  if (!event.target.files[0]) return;

  const fileName = event.target.files[0].name;
  const lastDot =  fileName.lastIndexOf('.');
  const fileExtension = fileName.slice(lastDot);

  if (!Object.values(IMAGE_FILE_TYPES).includes(fileExtension)) {
    return alert(`${fileExtension} files are not allowed!`);
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    socket.emit('sendImage', reader.result);
  };
  reader.readAsDataURL(event.target.files[0]);
});

$recordButton.addEventListener('click', () => {

});
