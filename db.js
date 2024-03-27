const mongoose = require('mongoose');
require("dotenv").config()

const mongo = ()=>{
     mongoose.connect(`mongodb+srv://robertjr:pg123456@cluster0.ljveogm.mongodb.net/db`,).then(()=>{
    console.log("DB connected")
    // console.log(process.env.DB_CONNECT)
  }).catch((err)=>console.log(err));
}

module.exports=mongo;