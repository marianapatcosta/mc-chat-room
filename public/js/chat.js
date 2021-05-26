const socket = io();
const alertSound = new Audio('../sounds/alert.mp3');

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $uploadButton = document.querySelector('#upload');
const $recordAudioButton = document.querySelector('#record-audio');
const $recordVideoButton = document.querySelector('#record-video');
const $pauseRecordingButton = document.querySelector('#pause-recording');
const $resumeRecordingButton = document.querySelector('#resume-recording');
const $stopRecordingButton = document.querySelector('#stop-recording');
const $switchCameraButton = document.querySelector('#switch-camera');
const $uploadInput = document.querySelector('#upload-input');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');
const $recordingCard = document.querySelector('.recording');
let isFrontCamera = true;
let $imageMessages;
let $videoMessages;
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
const audioMessageTemplate = document.querySelector(
  '#audio-message-template'
).innerHTML;
const videoMessageTemplate = document.querySelector(
  '#video-message-template'
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
const isTouchDevice = () => matchMedia('(hover: none)').matches;

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

const handleVideoMessages = () => {
  $videoMessages = document.getElementsByClassName('message__video');
  const newVideoElement = $videoMessages[$videoMessages.length -1];
  newVideoElement.addEventListener('click', () => {
    if (newVideoElement.classList.contains('message__video--zoomed')) {
      return newVideoElement.classList.remove('message__video--zoomed');
    }
    newVideoElement.classList.add('message__video--zoomed');
  });
};

const handleInsertHtml = (html, isSender) => {
  $messages.insertAdjacentHTML('beforeend', html);
  $messages.lastElementChild.scrollIntoView(false);
  !isSender && alertSound.play();
}

const getMedia = async (constraints) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    alert('It was not possible to access to your camera and/or microphone')
  }
}

const stopStream = stream => stream.getTracks().forEach(track => track.stop());

const onSwitchCamera =  (mediaRecorder) => { 
  isFrontCamera = !isFrontCamera; 
  stopStream(mediaRecorder.stream);
  onRecordVideo();
};

const onStartRecording = (mediaRecorder, isVideo) => {
  if (isTouchDevice() && isVideo) {
    $switchCameraButton.style.display = 'flex';
    $switchCameraButton.addEventListener('click', (mediaRecorder) => onSwitchCamera(mediaRecorder));
  }
  $recordingCard.style.display = 'flex';
  $resumeRecordingButton.style.display = 'none';
  $recordAudioButton.disabled = true;
  $recordVideoButton.disabled = true;
  $pauseRecordingButton.addEventListener('click', () => mediaRecorder.pause());
  $resumeRecordingButton.addEventListener('click', () => mediaRecorder.resume());
  $stopRecordingButton.addEventListener('click', () => mediaRecorder.stop());
}

const onPauseRecording = () => {
  $resumeRecordingButton.style.display = 'inline-block';
  $pauseRecordingButton.style.display = 'none';
}

const onResumeRecording = () => {
  $resumeRecordingButton.style.display = 'none';
  $pauseRecordingButton.style.display = 'inline-block';
}

const onStopRecording = (mediaRecorder, isVideo) => {
  stopStream(mediaRecorder.stream);
  if (isTouchDevice() && isVideo) {
    $switchCameraButton.style.display = 'none';
    $switchCameraButton.removeEventListener('click', (mediaRecorder) => onSwitchCamera(mediaRecorder));
  } 
  $recordingCard.style.display = 'none';
  $recordAudioButton.disabled = false;
  $recordVideoButton.disabled = false;
  $pauseRecordingButton.style.display = 'inline-block';
  $resumeRecordingButton.style.display = 'inline-block';
  $pauseRecordingButton.removeEventListener('click', () => mediaRecorder.pause());
  $resumeRecordingButton.removeEventListener('click', () => mediaRecorder.resume());
  $stopRecordingButton.removeEventListener('click', () => mediaRecorder.stop());
}

// socket handlers

socket.on('message', ({ username: senderUsername, text, createdAt, src })  => {
  const html = Mustache.render(messageTemplate, {
    username: senderUsername,
    message: text,
    createdAt: moment(createdAt).format('h:mm a'),
    isSentMessage: username === senderUsername
  });
  handleInsertHtml(html, username === senderUsername);
});

socket.on('locationMessage', ({ username: senderUsername, locationUrl, createdAt })  => {
  const html = Mustache.render(locationMessageTemplate, {
    username: senderUsername,
    myCurrentLocation: locationUrl,
    createdAt: moment(createdAt).format('h:mm a'),
    isSentMessage: username === senderUsername
  });
  handleInsertHtml(html, username === senderUsername);
});

socket.on('imageMessage', ({ username: senderUsername, createdAt, src }) => {
  const html = Mustache.render(imageMessageTemplate, {
    username: senderUsername,
    createdAt: moment(createdAt).format('h:mm a'),
    isSentMessage: username === senderUsername,
    imageSrc: src
  });
  handleInsertHtml(html, username === senderUsername);
  handleImageMessages();
});

socket.on('audioMessage', ({ username: senderUsername, createdAt, src }) => {
  const html = Mustache.render(audioMessageTemplate, {
    username: senderUsername,
    createdAt: moment(createdAt).format('h:mm a'),
    isSentMessage: username === username,
    audioSrc: src
  });
  handleInsertHtml(html, username === senderUsername);
});

socket.on('videoMessage', ({ username: senderUsername, createdAt, src }) => {
  const html = Mustache.render(videoMessageTemplate, {
    username: senderUsername,
    createdAt: moment(createdAt).format('h:mm a'),
    isSentMessage: username === username,
    videoSrc: src
  });
  handleInsertHtml(html, username === senderUsername);
  handleVideoMessages();
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
  const lastDot = fileName.lastIndexOf('.');
  const fileExtension = fileName.slice(lastDot);

  if (!Object.values(IMAGE_FILE_TYPES).includes(fileExtension)) {
    return alert(`${fileExtension} files are not allowed!`);
  }

  const reader = new FileReader();
  reader.onloadend = () => socket.emit('sendImageMessage', reader.result);
  reader.readAsDataURL(event.target.files[0]);
});

$recordAudioButton.addEventListener('click', async () => {
  const mediaStream = await getMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(mediaStream)
  const chunks = [];

  mediaRecorder.onstart = () => onStartRecording(mediaRecorder);
  mediaRecorder.onpause = onPauseRecording;
  mediaRecorder.onresume = onResumeRecording;
  mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(chunks, {'type' : 'audio/mp3; codecs=opus'});
    socket.emit('sendAudioMessage', URL.createObjectURL(audioBlob));
    onStopRecording(mediaRecorder);
  };

  // Start recording
  mediaRecorder.start();
});

const onRecordVideo = async () => {
  const constraints = isTouchDevice() ? {video: { facingMode: isFrontCamera ? 'user' : 'environment' }} : { video: true, audio: true }
  const mediaStream = await getMedia(constraints);
  const mediaRecorder = new MediaRecorder(mediaStream)
  const chunks = [];

  mediaRecorder.onstart = () => onStartRecording(mediaRecorder, true);
  mediaRecorder.onpause = onPauseRecording;
  mediaRecorder.onresume = onResumeRecording;
  mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
  mediaRecorder.onstop = () => {
    const videoBlob = new Blob(chunks, { 'type' : 'video/mp4; codecs=opus' }); 
    socket.emit('sendVideoMessage', URL.createObjectURL(videoBlob));
    onStopRecording(mediaRecorder, true);
  };

  // Start recording
  mediaRecorder.start();
}

$recordVideoButton.addEventListener('click', onRecordVideo);
