const audioInputSelect = document.querySelector('select#audioSource')
const audioOutputSelect = document.querySelector('select#audioOutput')
const videoSelect = document.querySelector('select#videoSource')
const selectors = [audioInputSelect, audioOutputSelect, videoSelect]
let videoElement = document.getElementById('player')
let remoteVideo = document.getElementById('remoteVideo')
// console.log(videoElement)
// console.log(remoteVideo)
const btnstart = document.getElementById('start')
const btninit = document.getElementById('btninit')
const btncamera = document.getElementById('camera-btn')

let remote
let localStream
btncamera.onclick = () => {

 if(btncamera.classList.contains('active')){
    console.log('off')
    btncamera.classList.toggle('active')
    document.getElementById(`user-${uid}`).srcObject = null 

  }else{
    console.log('on')
    btncamera.classList.toggle('active')
    document.getElementById(`user-${uid}`).srcObject = localStream

  }

  localStream.getVideoTracks()[0].enabled = !(localStream.getVideoTracks()[0].enabled);

}

var constraints = {
  audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
  video: { deviceId: videoSource ? { exact: videoSource } : undefined },
  // audio:true,
  // video:true
}
const signalOption = {
    offerToReceiveAudio: 1, // 是否傳送聲音流給對方
    offerToReceiveVideo: 1, // 是否傳送影像流給對方
  };
  
  
  // 將讀取到的設備加入到 select 標籤中
  const gotDevices = (deviceInfos) => {
    // Handles being called several times to update labels. Preserve values.
    const values = selectors.map((select) => select.value)
    selectors.forEach((select) => {
      while (select.firstChild) {
        select.removeChild(select.firstChild)
      }
    })
    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i]
      const option = document.createElement('option')
      option.value = deviceInfo.deviceId
      if (deviceInfo.kind === 'audioinput') {
        option.text =
          deviceInfo.label || `microphone ${audioInputSelect.length + 1}`
        audioInputSelect.appendChild(option)
      } else if (deviceInfo.kind === 'audiooutput') {
        option.text =
          deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`
        audioOutputSelect.appendChild(option)
      } else if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`
        videoSelect.appendChild(option)
      } else {
        console.log('Some other kind of source/device: ', deviceInfo)
      }
    }
    selectors.forEach((select, selectorIndex) => {
      if (
        Array.prototype.slice
          .call(select.childNodes)
          .some((n) => n.value === values[selectorIndex])
      ) {
        select.value = values[selectorIndex]
      }
    })
  }
  
  // 手動修改音訊的輸出 例如預設耳機切換成喇叭
  const attachSinkId = (element, sinkId) => {
    if (typeof element.sinkId !== 'undefined') {
      element
        .setSinkId(sinkId)
        .then(() => {
          console.log(`Success, audio output device attached: ${sinkId}`)
        })
        .catch((error) => {
          let errorMessage = error
          if (error.name === 'SecurityError') {
            errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`
          }
          console.error(errorMessage)
          // Jump back to first output device in the list as it's the default.
          audioOutputSelect.selectedIndex = 0
        })
    } else {
      console.warn('Browser does not support output device selection.')
    }
  }
  
  // 處理音訊改變的方法
  function changeAudioDestination() {
    const audioDestination = audioOutputSelect.value
    attachSinkId(videoElement, audioDestination)
  }
  
  // 將視訊顯示在 video 標籤上
  function gotStream(stream) {
    console.log('gotstream',stream)
    videoElement.srcObject = stream
    localStream = stream
    
    return navigator.mediaDevices.enumerateDevices()
  }
  
  // 播放自己的視訊
  function start() {
    // videoElement = document.getElementById(`user-${uid}`)
    // remoteVideo = document.getElementById(`user-${uid}-audio`)
    if (window.stream) {
      window.stream.getTracks().forEach((track) => {
        track.stop()
      })
    }
    const audioSource = audioInputSelect.value
    const videoSource = videoSelect.value
    constraints = {
      audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
      video: { deviceId: videoSource ? { exact: videoSource } : undefined },
      // audio:true,
      // video:true
    }
    console.log('plat',constraints)
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(gotStream)
      .then(gotDevices)
      .then(initPeerConnection)
      .catch(handleError)
  }
  
  const addLocalStream = () => {
    console.log('add localstream')
    localStream.getTracks().forEach((track) => {
      peer.addTrack(track, localStream);
      console.log(track.kind)
      if(track.kind === 'audio'){

      }
      console.log(track)
    });

  };
  
  //peer connection
  //peer建立
  const createPeerConnection = () => {
    const configuration = {
      iceServers: [{
        urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
      }]
     };
    peer = new RTCPeerConnection(configuration)
    console.log('peer created', peer)
  }
  
  //new
  // 監聽 ICE Server
  function onIceCandidates(uid) {
    // 找尋到 ICE 候選位置後，送去 Server 與另一位配對
    peer.onicecandidate = ({ candidate }) => {
      if (!candidate) { return; }
      console.log('onIceCandidate => ', candidate);
      socket.emit("peerconnectSignaling",room ,{ candidate },uid);
    };
  };
  
  // 監聽 ICE 連接狀態
  function onIceconnectionStateChange() {
    peer.oniceconnectionstatechange = (evt) => {
      console.log('ICE 伺服器狀態變更 => ', evt.target.iceConnectionState);
    };
  }
  
  let addvideoToDom = () => {
    // let messagesWrapper = document.getElementById('video')
    // console.log('test')
    let newMessage = `<div class="video__container" id="user-container-remoteVideo">
                          <div class="video-player" id="user-remoteVideo-max">
                            <video autoplay playsinline  id="remoteVideo"></video>
                          </div>
                      </div>`
   
    // messagesWrapper.insertAdjacentHTML('beforeend', newMessage)
    document.getElementById('streams__container').insertAdjacentHTML('beforeend', newMessage)
    remoteVideo = document.getElementById('remoteVideo')
    document.getElementById(`user-container-remoteVideo`).addEventListener('click', expandVideoFrame)
    // let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    // if(lastMessage){
    //     lastMessage.scrollIntoView()
    // }
  }
  // 監聽是否有流傳入，如果有的話就顯示影像
  function onAddStream() {
    peer.onaddstream = (event) => {
      addvideoToDom()
      if(!remoteVideo.srcObject && event.stream){
        remoteVideo.srcObject = event.stream;
        console.log('接收流並顯示於遠端視訊！', event);
        remote = remoteVideo
      }
    }
  }
  
  
  function initPeerConnection() {
    // start();
    peer.close()
    console.log('end start')
    createPeerConnection();
    console.log('initial peer connection')
    addLocalStream();
    onIceCandidates();
    onIceconnectionStateChange();
    onAddStream();
  }


  
  async function createSignal(isOffer) {
    try {
      if (!peer) {
        console.log('尚未開啟視訊');
        return;
      }
      // 呼叫 peerConnect 內的 createOffer / createAnswer
      offer = await peer[`create${isOffer ? 'Offer' : 'Answer'}`](signalOption);
  
      // 設定本地流配置
      await peer.setLocalDescription(offer);
      sendSignalingMessage(peer.localDescription, isOffer ? true : false)
    } catch(err) {
      console.log(err);
    }
  };
  
  function sendSignalingMessage(desc, offer) {
    const isOffer = offer ? "offer" : "answer";
    console.log(`寄出 ${isOffer}`);
    socket.emit("peerconnectSignaling",room ,{ desc });
  };
  
  // 錯誤處理
  function handleError(error) {
    console.log(
      'navigator.MediaDevices.getUserMedia error: ',
      error.message,
      error.name,
    )
  }

  // audioOutputSelect.onchange = changeAudioDestination
  // btninit.onclick = () => initPeerConnection()
  // btnstart.onclick = () => createSignal(true)
///////////////========================================================================================
let localTracks = []
let uid = sessionStorage.getItem('uid')
if(!uid){
    uid = String(Math.floor(Math.random() * 10000))
    sessionStorage.setItem('uid', uid)
}

let joinStream =  async() => {
    document.getElementById('join-btn').style.display = 'none'
    //button
    document.getElementsByClassName('stream__actions')[0].style.display = 'flex'
    console.log(uid)

              let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}-max">

                      <video autoplay playsinline muted id="user-${uid}"></video>
                    </div>
                 </div>`
    // console.log(videoElement)
    // console.log(remoteVideo)
    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
    videoElement = document.getElementById(`user-${uid}`)
    document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)


    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError)
    start();
    // initPeerConnection()
    
}
// console.log('456')
document.getElementById('join-btn').addEventListener('click',()=>{
  joinStream()
  pulling()
  console.log('join')
  // streaming()
})

document.getElementById('up-btn').addEventListener('click',()=>{
  createSignal(true)
  // streaming()
})
// document.getElementById('pull-btn').addEventListener('click', pulling)
document.getElementById('mic-btn').addEventListener('click',(e)=>{
  console.log(peer)
  console.log(document.getElementById('mic-btn').classList)
  if (document.getElementById('mic-btn').classList.contains('active')){
    document.getElementById('mic-btn').classList.toggle('active')
    document.getElementById('on').hidden = true
    document.getElementById('off').hidden = false
  }else{
    document.getElementById('mic-btn').classList.toggle('active')
    document.getElementById('off').hidden = true
    document.getElementById('on').hidden = false
  }
  localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
  // createSignal(true)
  // streaming()
})

function videoPeerConnection() {
  console.log('video peerconnection')
 
  
}
