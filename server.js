let express = require('express')
let bodyParser = require('body-parser')
let mongoose = require('mongoose')
let app = express()
let http = require('http').Server(app)
let io = require('socket.io')(http)

mongoose.Promise = Promise
let dburl = 'mongodb://user:user12@ds333248.mlab.com:33248/learning-node'
let Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.use(express.static(__dirname))
app.use(bodyParser.json()) // this is to allow body parsing
app.use(bodyParser.urlencoded({extended:false}))


app.get('/messages', (req, res) => {
    Message.find({},(err, messages)=>{
        res.send(messages)
    })
})

app.get('/messages/:user', (req, res) => {
    let user = req.params.user
    Message.find({name:user},(err, messages)=>{
        res.send(messages)
    })
})

app.post('/messages', async (req, res) => {
    try {
        let message = new Message(req.body)
    
        let savedMessage = await message.save()
        console.log('saved')
        let censored = await Message.findOne({message:'badword'})

        if(censored){
            console.log('censored word found', censored)
            await Message.remove({_id: censored.id})
        }else{
            io.emit('message', req.body)
        }

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally{

    }
})

io.on('connection', (socket)=>{
    console.log('user connected')
})

mongoose.connect(dburl,{ useNewUrlParser: true, useUnifiedTopology: true }, (err)=>{
    console.log('mongo connected with err: ', err)
})

let server = http.listen(3000, () =>{
    console.log(`server is listening one port ${server.address().port}`)
})