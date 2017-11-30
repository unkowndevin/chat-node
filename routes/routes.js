const express = require('express');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');
const A = require('../models/a');

module.exports = function(dirname){
    router.get('/', (req, res) =>{
        res.sendFile(path.join(dirname,'public','index.html'));
    });
    router.get('/chat/index', (req, res) =>{
        res.sendFile(path.join(dirname,'public','index.html'));
    });
    router.post('/check/database/login', (req, res) =>{
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
    router.get('/chat/chat',(req, res) =>{
        if(req.session.n){
            res.sendFile(path.join(dirname,'public','login.html'));
        }else{
            req.session.save((err)=>{
                if(err){
                    console.log(err);
                }else{
                    res.redirect('index');
                }
            })
        }
    });
    router.get('/get/login/data/nick', (req, res) =>{
        res.json({
            n : req.session.n
        });
    })
    router.post('/get/key/final', (req, res) => {
        res.json({
            key : req.body.key
        });
    });
    return router;
};