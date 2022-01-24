
function askName() {
  let username = sessionStorage.getItem('username');

  if (username === null) {
    username = prompt("To make your time on this website better, please enter your name.");
  }

  if (username != null) {
    sessionStorage.setItem('username', username);
  } else {
    sessionStorage.setItem('username', "Stranger" + Math.floor(Math.random() * (999 - 2) + 1));
  }
  document.getElementById("userpara").innerHTML = username;
}

window.onload = askName;

const updateScroll = () => {
  var element = document.querySelector('#events');
  element.scrollTop = element.scrollHeight;
};

const writeEvent = (text) => {
  // <ul> element
  const parent = document.querySelector('#events');

  // <li> element
  const el = document.createElement('li');
  el.innerHTML = text;

  parent.appendChild(el);
  updateScroll();
};

const onFormSubmitted = (e) => {
  e.preventDefault();

  const input = document.querySelector('#chat');
  const text = input.value;
  input.value = '';

  sock.emit('message', sessionStorage.getItem('username') + ": " + "<span>" + text + "</span>");
};

const addButtonListeners = () => {
  ['rock', 'paper', 'scissors', 'lizard', 'spock'].forEach((id) => {
    const button = document.getElementById(id);
    button.addEventListener('click', () => {
      sock.emit('turn', id);
    });
  });
};

writeEvent('Welcome to RPSLS, ' + sessionStorage.getItem('username') + "!");

const sock = io();
sock.on('message', writeEvent);

document
  .querySelector('#chat-form')
  .addEventListener('submit', onFormSubmitted);

addButtonListeners();
