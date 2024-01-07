const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const mongo = require("./db.js")
const user2022 = require('./Models/User.js')
const birth = require('./Models/BirthBash.js')
const cors = require('cors')
const auth = require('./Middleware/auth')
const app = express()
const PORT = process.env.PORT || 4400;
const cookieParser = require('cookie-parser')


const corsOptions = {
    origin: `${process.env.CORS_ORIGIN}`,
    credentials: true, // This is important for cookies
    methods: ["GET", "POST", "DELETE"],
};

app.use(bodyParser.urlencoded({ extended: true }));
mongo()
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());


app.post('/Oauth', async (req, res) => {
    let rollNo = req.body.roll;

    try {
        const checkRoll = await user2022.findOne({ RollNo: rollNo }, {})

        if (checkRoll) {
            const response = {
                username: checkRoll.Name,
                password: checkRoll.DOB,
                auth: "exist"
            }

            return res.json(response)
        }
        else if (!checkRoll) {
            return res.json("notExist")
        }
    }
    catch (err) {
        console.log(err)
    }
})

app.post('/OAuth1', async (req, res) => {
    const { a, b } = req.body;

    let rollNo = req.body.a;
    let password = req.body.b;

    try {
        let token;
        if (!rollNo || !password) {
            const response = {
                auth: "Invalid"
            }
            return res.json(response)
        }

        const checkRoll = await user2022.findOne({ RollNo: rollNo }, {})
        if (checkRoll) {
            if (checkRoll.DOB === password) {
                token = await checkRoll.generateAuthToken1();
                res.cookie("jwt", token, {
                    secure: true,
                    sameSite: 'none',
                })
            }
            else {
                const response = {
                    auth: "Invalid",
                }
                res.json(response)
            }
        }
        if (checkRoll) {
            if (checkRoll.DOB !== password) {
                const response = {
                    auth: "Invalid"
                }
                res.json(response)
            }
            else if (checkRoll.DOB === password) {
                const response = {
                    auth: "valid"
                }
                res.json(response)
            }
        }
    } catch (err) {
        console.log(err)
    }
})

app.post('/checkDate', async (req, res) => {
    const liveDate = req.body.todayDate;

    const users = await birth.find({Matcher: liveDate});
    console.log(users);
    return res.json(users);
})


app.get('/', auth, (req, res) => {
    res.send(req.user)
})

app.get('/logout', (req, res) => {
    console.log("fetched logout")
    res.clearCookie("jwt", {
        path: '/',
        secure: true,
        sameSite: 'none',
    });
    res.status(200).send('User Logout');

})

app.listen(PORT, () => {
    console.log("PORT connected")
})
