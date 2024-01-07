const mongoose = require('mongoose');
require("dotenv").config()

const mongo = ()=>{
     mongoose.connect(`${process.env.CONN_STR}`,).then(()=>{
    console.log("DB connected")
    // console.log(process.env.DB_CONNECT)
  }).catch((err)=>console.log(err));
}

module.exports=mongo;