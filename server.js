
var express = require('express');
var app = express();


var server = app.listen(process.env.PORT || 3000, listen);

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));
console.log("my server is running");


 var socket = require('socket.io');

 var io = socket(server);

 io.sockets.on('connection', connection);

 function connection(socket)
 {
   console.log("New Connection");
   socket.broadcast.emit('addBall')
   socket.on('ballPos', getBallPos);

   function getBallPos(sentBallPos, walls)
   {
     socket.broadcast.emit('ballPos', sentBallPos, walls);
   }
 }
