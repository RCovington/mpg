
function askName() {
  let username = sessionStorage.getItem('username');

  if (username === null) {
    username = prompt("To make your time on this website better, please enter your name.");
  }

  if (username != null) {
    sessionStorage.setItem('username', username);
  } else {
    username = "Stranger" + Math.floor(Math.random() * (999 - 2) + 1);
    sessionStorage.setItem('username', username);
  }
  document.getElementById("userpara").innerHTML = username;
  // Check for NAME, CHOICE & TOTAL in localstorage and store it, if it doesn't exist 
  sessionStorage.setItem('choice', 'none');
  sessionStorage.setItem('total', '0');

  sock.emit("playerJoin", username);
}

window.onload = askName;

const updateScroll = () => {
  var element = document.querySelector('#events');
  element.scrollTop = element.scrollHeight;
};

const playerJoin = (text) => {
  // Parameter is in the form of:: currName + ":" + sock.id
  let username = text.slice(0, text.indexOf(":"));
  let usrSockId = text.substring(text.indexOf(":") + 1);
  //console.log("usrSockId = " + usrSockId + " & " + "username = " + username);

  // Notify on chat box


  // Add user to table: "tbl-players"
  let tbl = document.getElementById('tbl-players');
  let row1 = tbl.insertRow();
  row1.id = usrSockId;
  //console.log("row.id = " + row1.id);
  let cell1 = row1.insertCell();
  let txt1 = document.createTextNode("NOT Ready");
  cell1.appendChild(txt1);

  cell1 = row1.insertCell();
  txt1 = document.createTextNode(username);
  cell1.appendChild(txt1);

  cell1 = row1.insertCell();
  txt1 = document.createTextNode("0");
  cell1.appendChild(txt1);
};

const disconnect = (text) => {
  // Parameter is in the form of:: name + ":" + sock.id
  // Notify on chat box

  // Remove user from table

};

const ready = (text) => {
  // Parameter is in the form of:: User Sock.it
  // Modify user to table
};

const notReady = (text) => {
  // Parameter is in the form of:: User Sock.it

};

const results = (text) => {
  // Parameter is in the form of:: nameMap.forEach resultString += currUserName + " :" + currUserChoice + ";",,,
  // Generate the results strings relative to this user and post it to chat

  // Calculate the total change and update the table

};

const total = (text) => {
  // Parameter is in the form of::  total + ":" + sock.id

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
  ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock'].forEach((id) => {
    const button = document.getElementById(id);
    button.addEventListener('click', () => {
      sock.emit('choice', id);
    });
  });
};

writeEvent('Welcome to RPSLS, ' + sessionStorage.getItem('username') + "!");

const sock = io();
sock.on('message', writeEvent);
sock.on('playerJoin', playerJoin);
sock.on('disconnect', disconnect);
sock.on('ready', ready);
sock.on('notReady', notReady);
sock.on('results', results);
sock.on('total', total);

document
  .querySelector('#chat-form')
  .addEventListener('submit', onFormSubmitted);

addButtonListeners();
