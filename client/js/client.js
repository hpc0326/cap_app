'use strict'


//NEED TO DO : Solve the Start button problem DOMException
//Shorterm Goal : Fininsh the Cross-device WebRTC
const userName = document.querySelector('input#username')
const inputRoom = document.querySelector('input#room')
const btnConnect = document.querySelector('button#connect')
const btnLeave = document.querySelector('button#leave')
const outputArea = document.querySelector('textarea#output')
const inputArea = document.querySelector('textarea#input')
const btnSend = document.querySelector('button#send')
const btncreateChannel = document.querySelector('button#createChannel')
const btnStreaming = document.getElementById('streaming')
const btnPulling = document.getElementById('pulling')
const btnStopStreaming = document.getElementById('stopStreaming')

let socket
let room
let peer
let localStream
let offer


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
  btnStreaming.disabled = false
  btnPulling.disabled = false
  btnStopStreaming.disabled = true
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
  room = inputRoom.value
  socket = io()
  

  socket.on('joined', (room, id) => {
    btncreateChannel.disabled = true
    btnConnect.disabled = true
    btnLeave.disabled = false
    inputArea.disabled = false
    btnSend.disabled = false
  })

  socket.on('leave', (room, id) => {
    btncreateChannel.disabled = false
    btnConnect.disabled = false
    btnLeave.disabled = true
    inputArea.disabled = true
    btnSend.disabled = true

    socket.disconnect()
  })

  socket.on('message', (room, data) => {
    console.log(`This is room : ${room} and message is ${data}`)
    outputArea.scrollTop = outputArea.scrollHeight
    outputArea.value = outputArea.value + data + '\n'
  })

  socket.on('disconnect', (reason) => {
    btncreateChannel.disabled = false
    btnConnect.disabled = false
    btnLeave.disabled = true
    inputArea.disabled = true
    btnSend.disabled = true
  })

  socket.on('test', (data) => {
    console.log(data)
  })


  //Failed Area
  socket.on('createFailed', (msg)=>{
    console.log(msg)
    btncreateChannel.disabled = false
    btnConnect.disabled = false
    btnLeave.disabled = true
    inputArea.disabled = true
    btnSend.disabled = true
    socket.disconnect()
  })

  socket.on('joinFailed', (msg)=>{
    console.log(msg)
    btncreateChannel.disabled = false
    btnConnect.disabled = false
    btnLeave.disabled = true
    inputArea.disabled = true
    btnSend.disabled = true
    socket.disconnect()
  })

  socket.on('peerconnectSignaling', async ({ desc, candidate }) => {
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

btnSend.onclick = () => {
  let data = inputArea.value
  data = userName.value + ':' + data
  socket.emit('message', room, data)
  inputArea.value = ''
}

btnLeave.onclick = () => {
  room = inputRoom.value
  socket.emit('leave', room)
}

inputArea.onkeypress = (event) => {
  if (event.keyCode === 13) {
    let data = inputArea.value
    data = userName.value + ':' + data
    socket.emit('message', room, data)
    inputArea.value = ''
    event.preventDefault()
  }
}

btncreateChannel.onclick = () => socketFunc(1)
btnConnect.onclick = () => socketFunc(2)
btnStreaming.onclick = () => streaming()
btnStopStreaming.onclick = () => stopStreaming()
btnPulling.onclick = () => pulling()


