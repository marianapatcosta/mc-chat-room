const socket = io();
const alertSound = new Audio("../sounds/alert.mp3");

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $siderbar = document.querySelector("#sidebar");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } =
  location.search.split("&").length === 2 &&
  location.search.split("&")[0].includes("username") &&
  location.search.split("&")[1].includes("room")
    ? Qs.parse(location.search, {
        ignoreQueryPrefix: true
      })
    : (location.href = "/") && alert("Invalid Parameters!");

socket.on("message", message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
    isOwnMessage: username === message.username
  });
  $messages.insertAdjacentHTML("beforeend", html);
  $messages.lastElementChild.scrollIntoView(false)
  if (username !== message.username) {
    alertSound.play();
  }
});

socket.on("locationMessage", location => {
  const html = Mustache.render(locationMessageTemplate, {
    username: location.username,
    myCurrentLocation: location.locationUrl,
    createdAt: moment(location.createdAt).format("h:mm a"),
    isOwnMessage: username === location.username
  });
  $messages.insertAdjacentHTML("beforeend", html);
  $messages.lastElementChild.scrollIntoView(false)

  if (username !== location.username) {
    alertSound.play();
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  $siderbar.innerHTML = html;
});

$messageForm.addEventListener("submit", event => {
  event.preventDefault();

  //disable the form
  $messageButton.setAttribute("disabled", "disabled");

  const sentMessage = event.target.elements.message.value;
  socket.emit("sendMessage", sentMessage, error => {
    //re-enable the form
    $messageButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return alert(error);
    }
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser!");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(
    position => {
      socket.emit(
        "sendLocation",
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        () => {
          $sendLocationButton.removeAttribute("disabled");
        }
      );
    },
    error => {
      alert("Location not found!");
    },
    { timeout: 10000 }
  );
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
