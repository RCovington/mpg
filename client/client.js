
function askName() {
  let username = localStorage.getItem('username');

  if (username === null) {
    username = prompt("To make your time on this website better, please enter your name.");
  }

  if (username != null) {
    localStorage.setItem('username', username);
  } else {
    username = "Stranger" + Math.floor(Math.random() * (999 - 2) + 1);
    localStorage.setItem('username', username);
  }
  document.getElementById("userpara").innerHTML = username;
  // Check for NAME, CHOICE & TOTAL in localstorage and store it, if it doesn't exist 
  localStorage.setItem('choice', 'none');
  localStorage.setItem('total', '0');

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

  // Notify on chat box, if it isn't yourself
  if (usrSockId != sock.id) {
    writeEvent(username + " has Joined!");
  }

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
  let username = text.slice(0, text.indexOf(":"));
  let usrSockId = text.substring(text.indexOf(":") + 1);
  // Notify on chat box
  writeEvent(username + " has Disconnected.");

  // Remove user from table
  let row1 = document.getElementById(usrSockId);
  if (row1) {
    row1.remove();
  }
};

const ready = (text) => {
  // Parameter is in the form of:: UserSock.id
  let usrSockId = text.substring(text.indexOf(":") + 1);
  console.log("usrSockId: " + usrSockId);
  console.log("text: " + text);
  // Modify user to table
  let row1 = document.getElementById(text);
  row1.cells[0].childNodes[0].data = 'READY!';
};

const notReady = (text) => {
  // Parameter is in the form of:: UserSock.id
  let usrSockId = text.substring(text.indexOf(":") + 1);
  console.log("usrSockId: " + usrSockId);
  console.log("text: " + text);
  // Modify user to table
  let row1 = document.getElementById(usrSockId);
  if (row1) { row1.cells[0].childNodes[0].data = 'NOT Ready'; }
  // If it's this user, also modify the localStorage 'choice' item
  if (usrSockId == sock.id) {
    localStorage.setItem('choice', 'none');
  }
};

const results = (text) => {
  // Parameter is in the form of:: nameMap.forEach resultString += currUserName + " :" + currUserChoice + ";"...
  text = text.substring(0, text.length - 1);
  const usrChoices = text.split(';');
  console.log("usrChoices.length: " + usrChoices.length);
  let ptsTotal = 0;
  usrChoices.forEach((element) => {
    console.log("element: " + element);
    let username = element.slice(0, element.indexOf(":"));
    let choice = element.substring(element.indexOf(":") + 1);
    let currPts = getPoints(choice);
    ptsTotal += currPts;
    writeEvent(username + " chose " + choice + ": " + currPts);
  });

  // Calculate the total change and inform the server
  let myTotal = localStorage.getItem('total');
  sock.emit("total", myTotal + ptsTotal);
  let winMsg = "Tie.";
  if (ptsTotal != 0) { winMsg = (ptsTotal > 0) ? "You WIN!!!" : "You lose." } else { winMsg }
  writeEvent("TOTAL: " + ptsTotal + "... " + winMsg);
};

const getPoints = (oppChoice) => {
  let myChoice = localStorage.getItem('choice');
  if (oppChoice == myChoice) {
    return 0;
  }
  if (oppChoice == "Rock") { if (myChoice == "Paper" || myChoice == "Spock") return 1; } else { return -1; }
  if (oppChoice == "Paper") { if (myChoice == "Scissors" || myChoice == "Lizard") return 1; } else { return -1; }
  if (oppChoice == "Scissors") { if (myChoice == "Rock" || myChoice == "Spock") return 1; } else { return -1; }
  if (oppChoice == "Lizard") { if (myChoice == "Rock" || myChoice == "Scissors") return 1; } else { return -1; }
  if (oppChoice == "Spock") { if (myChoice == "Paper" || myChoice == "Lizard") return 1; } else { return -1; }
};

const total = (text) => {
  // Parameter is in the form of::  total + ":" + sock.id
  //Someones total has changed, update the table

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

  sock.emit('message', localStorage.getItem('username') + ": " + "<span>" + text + "</span>");
};

const addButtonListeners = () => {
  ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock'].forEach((id) => {
    const button = document.getElementById(id);
    button.addEventListener('click', () => {
      localStorage.setItem('choice', id);
      sock.emit('choice', id);
    });
  });
};

writeEvent('Welcome to RPSLS, ' + localStorage.getItem('username') + "!");

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
