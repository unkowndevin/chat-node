const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const A = new Schema({
    n : {type : String, required : true},
    e : {type : String, required : true},
    p : {type : String, required : true}
})
 module.exports = mongoose.model('user',A);