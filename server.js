
var express = require('express');
var app = express();

var socket = require('socket.io');

var server = app.listen(process.env.PORT || 3000, listen);
var io = socket(server);
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));
console.log("my server is running");


 io.sockets.on('connection', connection);
 var allClients = [];
 function connection(socket)
 {
   console.log("New Connection");
   allClients.push(socket);
      socket.on('disconnect', function()
      {
      console.log('Got disconnect!');
      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
      io.sockets.emit('disconnected');
    })

    if(allClients.length>1){
       io.sockets.emit('newConnection');
     }
     
   socket.on('ballPos', function(sentBallPos, walls)
 {
   socket.broadcast.emit('ballPos', sentBallPos, walls);
 });
   socket.on('gameEnd', function(winUsername)
 {
   io.sockets.emit('gameEnd', winUsername);
 });
   socket.on('sentUsername', function(username)
 {
   socket.broadcast.emit('sendingUsername', username);
 });
 }

 // function getBallPos(sentBallPos, walls)
 // {
 //   socket.broadcast.emit('ballPos', sentBallPos, walls);
 // }
 //
 // function sendUsername(username)
 // {
 //   socket.broadcast.emit('sendingUsername', username);
 // }
 //
 // function endGame(winUsername)
 // {
 //   io.sockets.emit('gameEnd', winUsername);
 // }
 // function clientDisconnected(socket)
 // {
 //   console.log("disconnect");
 // }
