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

  messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

  let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
  if(lastMessage){
      lastMessage.scrollIntoView()
  }
}

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

document.getElementById('donate-btn').onclick = () => {
  socket.emit('donation', room, displayName)
  donationToRoom(displayName)
}

let donationToRoom = (data) => {
    console.log(data)
    let messagesWrapper = document.getElementById('messages')
    // console.log('test')
    let newMessage = `<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${data}&nbsp:</strong>
                            <p class="message__text">-----give streamer donation !-----</p>
                        </div>
                    </div>`
    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)
  
    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }

}


const pulling = () => {
  createPeerConnection()
  console.log('pulling')
  console.log(peer)
  socket.emit('pulling', room , peer)
}



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
  
    socket.on('message', (room, data, Name) => {
      console.log(data)
      addMessageToDom(Name, data)
      
      // console.log(`This is room : ${room} and message is ${data}`)
      // outputArea.scrollTop = outputArea.scrollHeight
      // outputArea.value = outputArea.value + data + '\n'
    })
  
    socket.on('disconnect', (reason) => {

    })
    socket.on('test', (data) => {
      console.log('test')
    })

    socket.on('donatemsg', (data) => {
      console.log('donation socket')
      donationToRoom(data)
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


inputArea.onkeypress = (event) => {
  if (event.keyCode === 13 && inputArea.value !== "") {
    let data = inputArea.value
    socket.emit('message', room, data, displayName)
    inputArea.value = ''
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
