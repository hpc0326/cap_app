'use strict'


//NEED TO DO : Solve the Start button problem DOMException
//Shorterm Goal : Fininsh the Cross-device WebRTC
// const userName = document.querySelector('input#username')
const userName = sessionStorage.getItem('display_name')
const inputRoom = document.querySelector('input#room')
const btnConnect = document.querySelector('button#connect')
const btnLeave = document.querySelector('button#leave')
const outputArea = document.querySelector('textarea#output')
// const inputArea = document.querySelector('textarea#input')
const inputArea = document.querySelector('.type_txt')
const btnSend = document.querySelector('button#send')
// const btncreateChannel = document.querySelector('button#createChannel')
const btncreateChannel = document.getElementById('join-btn')
const btnStreaming = document.getElementById('streaming')
const btnPulling = document.getElementById('pulling')
const btnStopStreaming = document.getElementById('stopStreaming')

let socket
let room = inviteCode
let peer
let localStream
let offer


let addMessageToDom = (name, message) => {
  let messagesWrapper = document.getElementById('messages')
  // console.log('test')
  let newMessage = `<div class="message__wrapper">
                      <div class="message__body">
                          <strong class="message__author">${name}&nbsp:</strong>
                          <p class="message__text">${message}</p>
                      </div>
                  </div>`
  // let newMessage = `<div class="message__wrapper">
  //                     <div class="nav--list">
  //                         <strong class="message__author">${name} &nbsp :</strong>
  //                         <p class="message__text">${message}</p>
  //                     </div>
  //                   </div>`
  messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

  let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
  if(lastMessage){
      lastMessage.scrollIntoView()
  }
}
//test turn into other page
// let displayName = sessionStorage.getItem('display_name')
// if(!displayName){
//     window.location = 'lobby.html'
// }

const streaming = () => {
  navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError)
  start()
}

const stopStreaming = () => {
  socket.emit('stopStreaming', room, 'stopstreaming')
  // btnStreaming.disabled = false
  // btnPulling.disabled = false
  // btnStopStreaming.disabled = true
}

const pulling = () => {
  createPeerConnection()
  console.log('pulling')
  console.log(peer)
  socket.emit('pulling', room , peer)
}
// socket = io()
const socketFunc = (process) => {
    console.log(process)
    //const url = 'wss://20.189.104.97:4443'
    const url = 'http://localhost:3000'
    room = inviteCode
    socket = io()
    socket.on('success_create',(room,id)=>{
      console.log('success_create')
  })
  
    socket.on('joined', (room, id) => {
      console.log('success_join')
    })
  
    socket.on('leave', (room, id) => {

  
      socket.disconnect()
    })
  
    socket.on('message', (room, data) => {
      console.log(data)
      addMessageToDom(displayName,data)
      // console.log(`This is room : ${room} and message is ${data}`)
      // outputArea.scrollTop = outputArea.scrollHeight
      // outputArea.value = outputArea.value + data + '\n'
    })
  
    socket.on('disconnect', (reason) => {

    })
  
    socket.on('test', (data) => {
      console.log(data)
    })
  
  
    //Failed Area
    socket.on('createFailed', (msg)=>{
      console.log(msg)

      socket.disconnect()
    })
  
    socket.on('joinFailed', (msg)=>{
      console.log(msg)

      socket.disconnect()
    })
  
    socket.on('peerconnectSignaling', async ({ desc, candidate },uid) => {
      // desc 指的是 Offer 與 Answer
      // currentRemoteDescription 代表的是最近一次連線成功的相關訊息
      if (desc && !peer.currentRemoteDescription) {
        console.log('desc => ', desc);
        
        await peer.setRemoteDescription(new RTCSessionDescription(desc));
        createSignal(desc.type === 'answer' ? true : false);
      } else if (candidate) {
        // 新增對方 IP 候選位置
        console.log('candidate =>', candidate);
        peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  
    //-------------------------
  
  
    //exe init
    if(process == 1){
      console.log('url')
      socket.emit('create', room)
      console.log('url')
    }else if (process == 2){
      socket.emit('join', room)
    }
    //------------------------------
  }

// btnSend.onclick = () => {
//   let data = inputArea.value
//   data = userName.value + ':' + data
//   socket.emit('message', room, data)
//   inputArea.value = ''
// }

// btnLeave.onclick = () => {
//   room = inputRoom.value
//   socket.emit('leave', room)
// }
inputArea.onkeypress = (event) => {
  if (event.keyCode === 13 && inputArea.value !== "") {
    // console.log('send........',room)
    // event.preventDefault()
    let data = inputArea.value
    // console.log('message'+inputArea.value)
    // data = displayName + ':' + data
    
    socket.emit('message', room, data)
    inputArea.value = ''
    // event.preventDefault()
  }
}
// window.addEventListener("unload", function(event) {
//   socket.emit('leave', room, socket.id)
//   console.log('jaaaa')
// });
window.onload = function(event) {  
  socketFunc(2)
};
window.onbeforeunload = function(event) {  
      event.returnValue = "我在這寫點東西...";
      socket.emit('leave', room, socket.id)
      // console.log(socket.id)
};
// window.onunload = function(event) {  
//   // event.returnValue = "我在這寫點東西...";
//   socket.emit('leave', room, socket.id)
//   // console.log(socket.id)
// };
// window.addEventListener('unload', (event) => {socket.emit('leave', room, socket.id) });
// $(document).on("submit", "form", function(event){
//   window.onbeforeunload = null;
// });
// btncreateChannel.onclick = () => socketFunc(1)
// btnConnect.onclick = () => socketFunc(2)
// btnStreaming.onclick = () => streaming()
// btnStopStreaming.onclick = () => stopStreaming()
// btnPulling.onclick = () => pulling()

// if(inviteCode){
//     console.log('display room client : ' + inviteCode)
//     socketFunc(1)
//   }

// let joinStream = async () => {
//   document.getElementById('join-btn').style.display = 'none'
//   document.getElementsByClassName('stream__actions')[0].style.display = 'flex'

//   localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {encoderConfig:{
//       width:{min:640, ideal:1920, max:1920},
//       height:{min:480, ideal:1080, max:1080}
//   }})


//   let player = `<div class="video__container" id="user-container-${uid}">
//                   <div class="video-player" id="user-${uid}"></div>
//                </div>`

//   document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
//   document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)

//   localTracks[1].play(`user-${uid}`)
//   await client.publish([localTracks[0], localTracks[1]])
// }

// document.getElementById('join-btn').addEventListener('click', joinStream)