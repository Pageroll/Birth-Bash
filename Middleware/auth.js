// const userSchema = require('../Models/UserFiles.js')
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken')
const user2022 = require('../Models/User.js');
const birth = require('../Models/BirthBash.js');

var Count = 0;
const auth = async (req, res, next) => {
    try {
        const token = await req.cookies.jwt
        console.log(token);
        const verifyUser = jwt.verify(token, `${process.env.SECRET_KEY}`);
        console.log(verifyUser)
        // const user2 = await user2022.findOne({ _id: verifyUser._id, "tokens.token": token });
        const user3 = await birth.findOne({ _id: verifyUser._id, "tokens.token": token })
        // if (!user2) {
            if (!user3) { throw new Error('User Not Found') }

            else if (user3) {
                console.log(user3)
                req.token = token;
               // req.user = user3;
              //  req.userID = user3._id;
                next();
            }
        // }
        // if (user2) {
        //     req.token = token;
        //     req.user = user2;
        //     req.userID = user2._id;
        //     next();
        // }
    }
    catch (error) {
        res.status(401).send("No token provded");
        console.log(error);
    }
}

module.exports = auth;











// const userSchema = require('../Models/UserFiles')
// const dotenv = require('dotenv');
// dotenv.config();
// const jwt = require('jsonwebtoken')
// const user2022 = require('../Models/User.js')

// var Count = 0;
// const auth = async (req, res, next) => {
//     try {
//         Count += 1;
//         console.log("auth reached :", Count);
//         const token = await req.cookies.jwt
//         const verifyUser = jwt.verify(token, `${process.env.SECRET_KEY}`);
//         console.log(verifyUser);
        
//         const user = await userSchema.findOne({ _id: verifyUser._id, "tokens.token": token });
//         const user2 = await user2022.findOne({ _id: verifyUser._id, "tokens.token": token });
//         if (!user && !user2) { throw new Error('User Not Found') }
//         else if (user) {
//             req.token = token;
//             req.user = user;
//             req.userID = user._id;
//             console.log(user.Name)
//             next();
//         }
//         else if (user2) {
//             req.token = token;
//             req.user = user2;
//             req.userID = user2._id;
//             console.log(user2.Name)
//             next();
//         }
//     }
//     catch (error) {
//         res.status(401).send("No token provded");
//         console.log(error);
//     }
// }

// module.exports = auth;