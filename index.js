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
           console.log("Room created");
       }else if(room.size === 1) {
           socket.join(roomName);
           console.log('Room joined');
       } else {
           console.log('Room full for now');
       }

       console.log(rooms);
    })
})