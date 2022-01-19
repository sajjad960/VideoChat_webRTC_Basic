let socket = io.connect("http://localhost:4000");
let divVideoChatLobby = document.getElementById("video-chat-lobby");
let divVideoChat = document.getElementById("video-chat-room");
let joinButton = document.getElementById("join");
let userVideo = document.getElementById("user-video");
let peerVideo = document.getElementById("peer-video");
let roomInput = document.getElementById("roomName");


joinButton.addEventListener('click', function(){
  if(roomInput.value === '') {
    alert('Please enter a room name')
  } else {
    socket.emit("join", roomInput.value)
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
  }
})