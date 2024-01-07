const userSchema = require('../Models/UserFiles.js')
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken')
const user2022 = require('../Models/User.js')

var Count = 0;
const auth = async (req, res, next) => {
    try {
        const token = await req.cookies.jwt
        const verifyUser = jwt.verify(token, `${process.env.SECRET_KEY}`);
        const user2 = await user2022.findOne({ _id: verifyUser._id, "tokens.token": token });
        if (!user2) { throw new Error('User Not Found') }
        else if (user2) {
            req.token = token;
            req.user = user2;
            req.userID = user2._id;
            next();
        }
    }
    catch (error) {
        res.status(401).send("No token provded");
        console.log(error);
    }
}

module.exports = auth;