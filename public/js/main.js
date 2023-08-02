if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(serviceWorker => console.log("Service Worker Registed:"))
    .catch(err => console.error("Error registering the Service Worker: ", err))
  navigator.serviceWorker.onmessage = event => {
    const message = JSON.parse(event.data)
    //console.log("Mensagem do Sevice Worker :", message)
    state.usuarios = [...message.data, ...state.usuarios]

  }
}
setTimeout(() => fetch('/api/usuarios').then(res => res.json()).then(data => state.usuarios = [...state.usuarios, ...data]), 5000)

const usuarios = [{
  "_id": "6035114fc66367076c4940c0",
  "sexo": "M",
  "image": "/img/avatar-4.png",
  "amigos": [],
  "conversas": [],
  "notificacoes": [],
  "nome": "Andelson Nuno",
  "email": "andelsonnuno@gmail.com",
  "senha": "$2b$10$DR32DsAGAz9SUP2OEUYELebRdkVqRhxjRXO4/eC6W.UmSQTwqjznS",
  "dataNascimento": "2000-03-01T08:00:00.000Z",
  "telefone": 921929374,
  "nacionalidade": "Angola",
  "__v": 0
},
{
  "_id": "60351158c66367076c4940c1",
  "sexo": "F",
  "image": "/img/avatar-1.png",
  "amigos": [],
  "conversas": [],
  "notificacoes": [],
  "email": "helena@gmail.com",
  "nome": "Helena Sebastião",
  "senha": "$2b$10$/Px23qFknzbVeHWymP067eybKBoLleEkYj5xOafSrKcNQmz2Zu9Ce",
  "dataNascimento": "1999-11-23T00:00:00.000Z",
  "nacionalidade": "Angola",
  "telefone": 929182345,
  "__v": 0
}]
const state = new Proxy({ usuarios }, {
  get(target, props) {
    //console.log("target: ", target, "props: ", props)
    return target[props]
  },
  set(target, props, value) {
    //console.log("target: ", target, "props: ", props, "value: ", value)
    target[props] = value
    renderUsuarios(target[props])
  }
})
const renderUsuarios = users => {
  const render = document.getElementById('render-user')
  const tamplete = (`
  ${state.usuarios.map(u => (`
    <div><strong>Nome</strong>: ${u.nome} - <strong>Sexo</strong>: ${u.sexo}</div>
  `)).join(' ')}`)
  //console.log(render)
  render.innerHTML = tamplete
}

function registrarNotificacoes() {
  function registrarBackgroundSync() {
    if (!navigator.serviceWorker) console.error("Service Worker não suportado!");

    navigator.serviceWorker.ready
      .then(registration => registration.sync.register('asyncAttendees'))
      .then(() => console.log("background sync registrado!"))
      .catch(err => console.error("Erro ao registrar o background sync", err))

    setTimeout(() => console.log("Notificacao!!!!!!!....."), 1000 * 60)
  }
  Notification.requestPermission((perimsion) => {
    if (perimsion === 'granted') registrarBackgroundSync()
    else console.error("permição não consedida! ");
  })
}
setTimeout(() => postMessage("hello your client"), 1000)
window.addEventListener('load', () => renderUsuarios())


let deferredPrompt; // Allows to show the install prompt
let setupButton;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault()
  deferredPrompt = event
  console.log("beforeinstallprompt fired");
  if (setupButton == undefined) {
    setupButton = document.getElementById("setup_button");
  }
  setupButton.style.display = "inline";
  setupButton.disabled = false;
})
function installApp() {
  // Show the prompt
  deferredPrompt.prompt();
  setupButton.disabled = true;
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice
      .then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
              console.log('PWA setup accepted');
              // hide our user interface that shows our A2HS button
              setupButton.style.display = 'none';
          } else {
              console.log('PWA setup rejected');
          }
          deferredPrompt = null;
      });
}
window.addEventListener('appinstalled', (evt) => {
  console.log("appinstalled fired", evt);
});

window.addEventListener('load', () =>{
  let mediaRecorder
  navigator
    .mediaDevices
    .getUserMedia({ audio: true })
    .then(stream =>{
      mediaRecorder = new MediaRecorder(stream)
      let chunks = []
      mediaRecorder.ondataavailable = (e) =>{
        chunks.push(e.data)
      }
      mediaRecorder.onstop = () =>{
        console.log("Audio Stoped!")
        const blob = new Blob(chunks, { type: "audio/ogg; code=opus" })
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        console.log(chunks)
        fetch('/api/audio', { method:"POST", body: {data: "chunks"}, headers: {'Content-Type':'application/json'}})
          .then(res => res.json())
          .then(console.log)
          .catch(console.error)

        reader.onloadend = _ =>{
          const audio = document.createElement('audio')
          const div = document.getElementById('audio')
          audio.src = reader.result
          audio.controls = true
          div.appendChild(audio)
          return;
        }
      }
      mediaRecorder.start()
      setTimeout(() => mediaRecorder.stop() , 3000)
      
    }).catch(err =>{
      console.log(err);
    })
})