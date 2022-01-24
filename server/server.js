const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const RpsGame = require('./rps-game');

const app = express();

const clientPath = `${__dirname}/../client`;
console.log(`Serving static from ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server);

let waitingPlayer = null;
var allClients = [];
var nameMap = new Map();
var choiceMap = new Map();
var totalMap = new Map();

const roundRes = (io, sock) => {
  //Transmit all the results to all players (io)
  let resultString = "";
  nameMap.forEach(function (value, key) {
    currUserName = value;
    currUserChoice = choiceMap.get(key);
    resultString += currUserName + " :" + currUserChoice + ";"
  });
  io.emit("results", resultString);

  //Reset the choice status
  choiceMap.forEach(function (value, key) {
    currUserKey = key;
    io.emit('notReady', currUserKey);
    choiceMap.set(currUserKey, "none");
  });
};

io.on('connection', (sock) => {
  allClients.push(sock);

  if (waitingPlayer) {
    new RpsGame(waitingPlayer, sock);
    waitingPlayer = null;
  } else {
    waitingPlayer = sock;
    waitingPlayer.emit('message', 'Waiting for an opponent');
  }

  sock.on('message', (text) => {
    console.log("Message recieved: " + text);
    io.emit('message', text);
  });

  sock.on('playerJoin', (text) => {
    let currName = text;
    console.log("Name received: " + text);
    //If the socket doesn't already exist, add it to the nameMap
    if (!nameMap.has(sock.id)) {
      //let all the other players know that this one joined
      io.emit('playerJoin', currName + ":" + sock.id);
      console.log("Broadcast playerJoin: " + currName);
      //let this new player know about all the other players
      console.log("Send back the existing players: " + nameMap.size);
      nameMap.forEach(function (value, key) {
        currUserKey = key;
        currUserChoice = choiceMap.get(currUserKey);
        sock.emit('playerJoin', value + ":" + currUserKey);
        console.log("Sent to " + currName + ", playerJoin: " + value + ":" + currUserChoice + "::" + currUserKey);
        if (currUserChoice == 'none') {
          console.log("Player NOT ready");
          sock.emit('notReady', currUserKey);
        } else {
          console.log("Player IS ready");
          sock.emit('ready', currUserKey);
        }
      });
      nameMap.set(sock.id, currName);
      console.log("key:" + sock.id + ' = ' + "value:" + currName);
    }

  });

  sock.on('choice', (text) => {
    // Parameter indicates the users selection ['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock', 'none']
    let isRoundReady = true;
    let roundResults = "";
    let currName = nameMap.get(sock.id);
    console.log("Choice received from " + currName + ": " + text);
    //If the socket DOES exist in the nameMap, add it to choiceMap
    if (nameMap.has(sock.id)) {
      choiceMap.set(sock.id, text);
    }
    nameMap.forEach(function (value, key) {
      if (text == "none") {
        io.emit('notReady', sock.id);
      } else {
        io.emit('ready', sock.id);
      }
      if (choiceMap.get(key) == 'none') {
        isRoundReady = false;
      }
      roundResults += "\n" + nameMap.get(key) + "->" + choiceMap.get(key);
    });
    if (isRoundReady) {
      roundRes(io, sock);
    }
  });

  sock.on('total', (text) => {
    let total = 0;
    if (totalMap.get(sock.id)) {
      total = totalMap.get(sock.id)
    }
    console.log("old total: " + total);
    total += text;

    totalMap.set(sock.id, total);
    console.log("new total: " + total);
    io.emit('total', total + ":" + sock.id);
  });

  sock.on('disconnect', function () {
    console.log(nameMap.get(sock.id) + ' got disconnect!');
    io.emit('disconnect', nameMap.get(sock.id) + ":" + sock.id)

    var i = allClients.indexOf(sock.id);
    allClients.splice(i, 1);
    nameMap.delete(sock.id)
  });


});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(8080, () => {
  console.log('RPS started on 8080');
});

