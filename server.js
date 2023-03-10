const express = require('express');
var app = express();
const path = require('path');
const http = require('http')
var server = http.createServer(app);

var port = process.env.PORT || 3000;
const socketIo = require('socket.io')
var io = socketIo(server);


let roomList = [] //room id
let streamingRoomList = [] //the room with streaming
let streamer = [] // the streamer id in the room. same order as streamingRoomList


server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'client')));


//function define
const checkRoomList = (room) => {
  if (roomList.indexOf(room) == -1) return -1
  else return 1
}



//------------------------------------

//socket part
// 收到使用者連線
io.sockets.on('connection', (socket) => {
  console.log(socket.id, '已連線')

  socket.on('message', (room, data, Name) => {
    io.in(room).emit('message', room, data, Name)
  })

  socket.on('create', (room) => {
    
    const tmp = checkRoomList(room)
    const ans = '您已創立聊天室\n房號為 : '
    console.log(tmp,room,'original : ',roomList)
    if(tmp == -1){
      socket.join(room)
      roomList.push(room)
      socket.emit('joined', room, socket.id)
      console.log(roomList)
      socket.emit('success_create')
      io.in(room).emit('message', room,ans+room)
    }else if (tmp == 1){
      
      const msg = 'The room has already been created'
      console.log(msg)
      socket.join(room)
      socket.emit('joined', room, socket.id)
      socket.emit('success_create')
      io.in(room).emit('message', room,ans+room)
      // console.log(room)
      //socket.emit('createFailed', room, msg)
    }
    
  })
  
  socket.on('join', (room)=> {
    const tmp = checkRoomList(room)
    if(tmp == 1){
      socket.join(room)
      console.log(room)
      socket.emit('joined', room, socket.id)
    }else if (tmp == -1){
      const msg = "the room didn't exist"
      socket.emit('joinFailed', msg)
    }
  })

  socket.on('leave', (room,id) => {
    console.log(room,id,'leave')
    socket.leave(room)
    socket.to(room).emit('bye', room, socket.id)
    socket.emit('leave', room, socket.id)
  })

  socket.on('streaming', (room, peerData) => {
    console.log(room)
    console.log(peerData)
    streamingRoomList.push(room)
    streamer.push(peerData)
    console.log(streamingRoomList)
  })

  socket.on('peerconnectSignaling', (room, message, uid) => {
    console.log('接收資料：', message);
    socket.to(room).emit('peerconnectSignaling', message,uid)
  });

  socket.on('stopStreaming', (room, data) => {
    delete streamingRoomList[streamingRoomList.indexOf(room)]
    console.log(data, room)
    console.log(streamingRoomList)
  })
  
  socket.on('pulling', (room, peerData) => {
    console.log('pulling')
    console.log(streamer[streamingRoomList.indexOf(room)])
    socket.to(streamer[roomList.indexOf(room)]).emit('test','test')
  })
  
  socket.on('donation', (room, data) => {
    //console.log('donation')
    console.log(room)
    socket.in(room).emit('donatemsg', data)

  })

})


