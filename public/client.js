const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

// WebRTC configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

let localStream;
let peerConnection;

// Получение локального видео
async function startLocalVideo() {
    localStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
    });
    localVideo.srcObject = localStream;
}

// Инициализация WebRTC
function initPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);
    
    // Добавление треков в соединение
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
}

// Запуск при загрузке страницы
startLocalVideo().then(initPeerConnection);
