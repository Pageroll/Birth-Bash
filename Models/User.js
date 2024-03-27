const mongoose = require("mongoose")
const { Schema } = mongoose
const dotenv = require('dotenv') ;
dotenv.config();

const jwt = require('jsonwebtoken');
const UserSchema1 = new Schema ({
    RollNo:{
        type: String,
        // required: true
    },

    DOB:{
        type: String,
        // required: true
    },

    Name: {
        type: String
    },

    branch: {
        type: String
    },

    Email:{
        type: String
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }]
})
UserSchema1.methods.generateAuthToken1=async function(){
    try{
        const token = jwt.sign({_id:this._id},`hello`)
        this.tokens = this.tokens.concat({token:token})
        await this.save() ;
        return token ;
    }
    catch(error){
        console.log(error) ; 
    }
}
module.exports = mongoose.model("2022-Batche", UserSchema1)

