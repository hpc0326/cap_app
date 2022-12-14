let form = document.getElementById('lobby__form')

let create = document.querySelector('.create')
let join = document.querySelector('.join')
let aname = document.querySelector('.name')
let room = document.querySelector('.room')

let inviteCode = sessionStorage.getItem('room_number')

let displayName = sessionStorage.getItem('display_name')

// let socket= sessionStorage.getItem('aaa')

if(displayName){
    form.name.value = displayName
    console.log(form.name.value)
}

form.addEventListener('submit', (e) => {
    console.log(e)
    e.preventDefault()
    console.log('press_createroom')
    console.log(create,join)

    sessionStorage.setItem('display_name', e.target.name.value)
    
    inviteCode = e.target.room.value
    if(!inviteCode){
        inviteCode = String(Math.floor(Math.random() * 10000))
        sessionStorage.setItem('room_number', inviteCode)
    }
    else{
        sessionStorage.setItem('room_number', inviteCode)
    }
    
    
    // window.location = `index.html?room=${inviteCode}`
    socketFunc(1)
})


const socketFunc = (process) => {
    console.log(process)
    //const url = 'wss://20.189.104.97:4443'
    const url = 'http://localhost:3000'
    room = inviteCode
    socket = io()
    sessionStorage.setItem('aaa', 123)

    socket.on('success_create',(room,id)=>{
        console.log('success_create')
        window.location = `index.html?room=${inviteCode}`
    })
  
    socket.on('joined', (room, id) => {
        console.log('success_join')
        window.location = `index.html?room=${inviteCode}`
    })
  
    socket.on('leave', (room, id) => {
      
      socket.disconnect()
    })
  
    socket.on('disconnect', (reason) => {
      
    })
  
    socket.on('test', (data) => {
      console.log(data)
    })
  
  
    //Failed Area
    socket.on('createFailed', (room,msg)=>{
        console.log('room')
      console.log(room)
      console.log(msg)
      socket.emit('join',room)
    //   socket.disconnect()
    })
  
    socket.on('joinFailed', (msg)=>{
      console.log(msg)
      
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
      console.log('created')
    }else if (process == 2){
        console.log('join')
      socket.emit('join', room)
    }
    //------------------------------
  }