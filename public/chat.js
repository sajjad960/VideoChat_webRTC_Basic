let socket = io.connect("http://localhost:4000");
let divVideoChatLobby = document.getElementById("video-chat-lobby");
let divVideoChat = document.getElementById("video-chat-room");
let joinButton = document.getElementById("join");
let userVideo = document.getElementById("user-video");
let peerVideo = document.getElementById("peer-video");
let roomInput = document.getElementById("roomName");
let roomName = roomInput.value;
let creator = false
let rtcPeerConnection;

//connecting ice server
const iceServers = {
  iceServers: [
    {urls: "stun:stun.services.mozilla.com"},
    {urls: "stun1.l.google.com:19302"},

  ]
}

joinButton.addEventListener('click', function(){
  if(roomInput.value === '') {
    alert('Please enter a room name')
  } else {
    socket.emit("join", roomName)
    
  }
})

socket.on('created', function() {
  let creator = true

  async function getMedia(constraints) {
  let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {width: 1280, height: 720}
      });
      /* use the stream */
      divVideoChatLobby.style = 'display:none'
      userVideo.srcObject = stream;
      userVideo.onloadedmetadata = function(e) {
        userVideo.play();
      };
      
      roomInput.value === ''
    } catch(err) {
      /* handle the error */
      console.log(err);
      alert('could not get the user device')
    }
  }
  getMedia()
})

socket.on('joined', function() {
  let creator = false

  async function getMedia(constraints) {
    let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {width: 1280, height: 720}
        });
        /* use the stream */
        divVideoChatLobby.style = 'display:none'
        userVideo.srcObject = stream;
        userVideo.onloadedmetadata = function(e) {
          userVideo.play();
        };
        
        socket.emit('ready', roomName)
      } catch(err) {
        /* handle the error */
        console.log(err);
        alert('could not get the user device')
      }
    }
    getMedia()
})
socket.on('full', function() {
  alert('room is full, can not join')
})

// Creating rtcpeerconnection and get cndidate from iceserver
socket.on('ready', function() {
  if(creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCndidateFunction;
  }
})
socket.on('offer', function() {})
socket.on('answer', function() {})

function OnIceCndidateFunction(event) {
  if(event.candidate) {
    socket.emit('candidate',event.candidate, roomName)
  }
}