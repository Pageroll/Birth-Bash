const mongoose = require("mongoose")
const { Schema } = mongoose
const dotenv = require('dotenv') ;
dotenv.config();

// const jwt = require('jsonwebtoken');
const UserBirth= new Schema ({
    RollNo:{
        type: String,
        // required: true
    },

    DOB:{
        type: String,
        // required: true
    },

    Matcher:{
        type: String
    },

    Name: {
        type: String
    },

    Branch: {
        type: String
    }
})
module.exports = mongoose.model("birthbashe", UserBirth)

