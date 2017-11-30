const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const A = require('./models/a');
const https_config = { 
    key: fs.readFileSync(path.join(__dirname,'crt','server.key')),
    cert: fs.readFileSync(path.join(__dirname,'crt','server.crt'))};
const port = 7935;
const https = require('http').createServer( app);
const io = require('socket.io')(https);
const body_parser = require('body-parser');
const cookie_parser = require('cookie-parser');
const session = require('express-session');
const helmet = require("helmet");
const RSA = require('node-rsa'); 
const cors = require('cors');
const crypter = new RSA({b: 2048});
app.use(cookie_parser());
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: false}));
app.use(session({
    secret: 'UnaPruebaMas',
    name : 'sessId',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: true
    }
}));
app.use(helmet.frameguard({action: 'deny'}));
app.use(helmet.hidePoweredBy({setTo : '??? 2.5.8.1.6'}));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.set('trust_proxy', 1);

//static files
app.use(express.static(path.join(__dirname,'public')));
//routes
app.all('*', function(req, res, next) {
    if(!req.session.control){
        req.session.control={
            views: 1,
            timeStamp : Date.now(),
            sign : false
        }
        next();
    }else{
        if(req.session.sign){
            res.end();
        }else{
            req.session.control.views++;
            if((Date.now()-req.session.control.timeStamp)>=1000){
                if(req.session.control.views>=10){
                    console.log(req.ip);
                    req.session.control.sign= true;
                    res.end();
                }else{
                    req.session.control.views=0;
                    req.session.control.timeStamp=Date.now();
                    next();
                }
            }else{
                if(req.session.control.views>=10){
                    res.end();
                }else{
                    
                    next();
                }
            }
        }
    }
});
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname,'public','index.html'));
});
app.get('/chat/index', (req, res) =>{
    res.sendFile(path.join(__dirname,'public','index.html'));
});
app.post('/check/database/login', (req, res) =>{
    mongoose.connect("mongodb://CH3L0V3C0:HkTfIpBs7iyunzNl@undevin-shard-00-00-mpd3g.mongodb.net:27017,undevin-shard-00-01-mpd3g.mongodb.net:27017,undevin-shard-00-02-mpd3g.mongodb.net:27017/chatjimmy?ssl=true&replicaSet=undevin-shard-0&authSource=admin", {
        useMongoClient : true
    });
    A.findOne({
        e : req.body.e
    }, (err, user) =>{
        if(user){
            if(user.p == req.body.p){
                req.session.n = user.n;
                res.json({
                    status : 200,
                    redirect : '/chat/chat'
                });
                mongoose.disconnect();
            }else{
                res.json({
                    status : 404,
                    message : 'Contraseña incorrecta'
                });
                mongoose.disconnect();
            }
        }else{
            res.json({
                status : 404,
                message : 'Usuario incorrecto'
            });
            mongoose.disconnect();
        }
    });
});
app.get('/chat/chat',(req, res) =>{
    if(req.session.n){
        res.sendFile(path.join(__dirname,'public','login.html'));
    }else{
        res.redirect('index');
    }
});
app.get('/get/login/data/nick', (req, res) =>{
    res.json({
        n : req.session.n
    });
})
app.post('/get/key/final', (req, res) => {
    res.json({
        key : req.body.key
    });
});

//socket
io.on('connection', (socket)=>{
    socket.control = {
        cont : 1,
        timeStamp : Date.now(),
        sign : false
    };
    console.log("usuario se ha conectado "+socket.client.id);
    socket.on("sended", (data) =>{
        socket.control.cont++;
        if(socket.control.sign){
            console.log('usuario desconectado '+socket.client.id);
            socket.disconnect();
        }else{
            if((Date.now()-socket.control.timeStamp)>=1000){
                if(socket.control.cont>=10){
                    socket.control.sign=true;
                    socket.disconnect();
                }else{
                    socket.control.cont=1;
                    socket.control.timeStamp=Date.now();
                    var response = {
                        message : {
                            normal : data.message,
                            crypted : crypter.encrypt(data.message, 'base64')
                        },
                        name : data.name
                    }
                    io.emit("sended", response);
                }
            }else{
                if(socket.control.cont>=10){
                    socket.control.sign=true;
                    socket.disconnect();
                }else{
                    var response = {
                        message : {
                            normal : data.message,
                            crypted : crypter.encrypt(data.message, 'base64')
                        },
                        name : data.name
                    }
                    io.emit("sended", response);
                }
            }
        }
    });
});

//servidor
https.listen(process.env.PORT || port, () =>{
    console.log("Https Server ready on Heroku",process.env.PORT);
});