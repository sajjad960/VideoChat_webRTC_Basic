//socket for production
let socket = io.connect("https://videoroom.findsajjad.com");


//socket for localhost
// let socket = io.connect("http://localhost:4000");

let divVideoChatLobby = document.getElementById("video-chat-lobby");
let divVideoChat = document.getElementById("video-chat-room");
let joinButton = document.getElementById("join");
let userVideo = document.getElementById("user-video");
let peerVideo = document.getElementById("peer-video");
let roomInput = document.getElementById("roomName");
let roomName = roomInput.value;
let creator = false;
let rtcPeerConnection;
let userStream;

//connecting ice server
const iceServers = {
  iceServers: [
    {urls: "stun:stun.services.mozilla.com"},
    {urls: "stun:stun1.l.google.com:19302"},
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
  creator = true

  async function getMedia(constraints) {
    try {
      userStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {width: 1280, height: 720}
      });
      /* use the stream */
      divVideoChatLobby.style = 'display:none'
      userVideo.srcObject = userStream;
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
  creator = false;
  console.log('user joined');

  async function getMedia(constraints) {
      try {
        userStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {width: 1280, height: 720}
        });
        /* use the stream */
        divVideoChatLobby.style = 'display:none'
        userVideo.srcObject = userStream;
        userVideo.onloadedmetadata = function(e) {
          userVideo.play();
        };
        console.log('joined');
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
socket.on('readyPeer', function() {
  console.log('check ready');
  if(creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCndidateFunction;
    rtcPeerConnection.ontrack = OnTrackFunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    // rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
    rtcPeerConnection
    .createOffer()
    .then((offer) => {
      rtcPeerConnection.setLocalDescription(offer);
      socket.emit("offer", offer, roomName);
    })
    .catch((error) => {
      console.log(error);
    });
  }
})

socket.on('candidate', function(candidate) {
  const icecandidate = new RTCIceCandidate({
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex,
  });
  rtcPeerConnection.addIceCandidate(icecandidate)
})

socket.on('offer', function(offer) {
  if (!creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCndidateFunction;
    rtcPeerConnection.ontrack = OnTrackFunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    // rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
    rtcPeerConnection.setRemoteDescription(offer);
    rtcPeerConnection
      .createAnswer()
      .then((answer) => {
        rtcPeerConnection.setLocalDescription(answer);
        socket.emit("answer", answer, roomName);
      })
      .catch((error) => {
        console.log(error);
      });
  }
})
socket.on('answer', function(answer) {
  rtcPeerConnection.setRemoteDescription(answer)
})

function OnIceCndidateFunction(event) {
  if(event.candidate) {
    socket.emit('candidate',event.candidate, roomName);
  }
}

function OnTrackFunction(event) {
  peerVideo.srcObject = event.streams[0];
  peerVideo.onloadedmetadata = function(e) {
    peerVideo.play();
  };
}