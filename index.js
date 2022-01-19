const express = require('express');
const socket = require("socket.io");


const app = express();


const server = app.listen(4000, function() {
    console.log('Server is running');
})

let io = socket(server);


app.use(express.static("public"))

// working with socket
io.on('connection', function(socket) {
    console.log('User connected' + socket.id);

    socket.on('join', function(roomName) {
        const rooms = io.sockets.adapter.rooms;
        const room = rooms.get(roomName);
        console.log(rooms, room);

       if(room === undefined) {
           socket.join(roomName);
           socket.emit('created')
       }else if(room.size === 1) {
           socket.join(roomName);
           socket.emit('joined')
       } else {
           socket.emit('full')
       }

       console.log(rooms);
    })

    // make ready to jhon , coz Bob need to know that jhon ready to connect, bcoz Bob created the room
    socket.on('ready', function(roomName) {
        console.log('ready');
        socket.broadcast.to(roomName).emit('ready')
    })

    // Craeting ICE, coz ICE need to connected with our public address, Bob with Jhon
    socket.on('candidate', function(candidate, roomName) {
        console.log('candidate');
        socket.broadcast.to(roomName).emit('candidate', candidate)
    })

      // sent a offer from BOB or anyone
      socket.on('offer', function(offer, roomName) {
        console.log('offer');
        socket.broadcast.to(roomName).emit('offer', offer)
    })

       // sent a aswer to BOB from jhon or anyone
       socket.on('answer', function(answer, roomName) {
        console.log('answer');
        socket.broadcast.to(roomName).emit('answer', answer)
    })

})