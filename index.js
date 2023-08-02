const express = require('express')
const https = require('http')
const bodyParser = require('body-parser')
const app = express()
const server = https.createServer(app)
app.use(bodyParser.json({ limit: '25mb' }))
app.use(express.static('./public'))
const PORT = process.env.PORT || 3001


const routerUsers = express.Router()
const routerAudioPost = express.Router()
routerUsers.get('/', (req, res) => {
  res.status(200).json(require('./datasUser'))
})
routerAudioPost.post('/', (req, res) => {
  console.log(req.body)
  res.status(200).json({ mensagem: "Ok!"})
})
app.use('/api/audio', routerAudioPost)
app.use('/api/usuarios', routerUsers)
server.listen(PORT, () => console.log(`running in port ${PORT}`))
