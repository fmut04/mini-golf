var express = require('express');
var cors = require('cors');
var app = express();


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();});
var server = app.listen(3000, listen);

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
