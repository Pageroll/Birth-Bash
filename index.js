const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const mongo = require("./db.js")
const user2022 = require('./Models/User.js')
const birth = require('./Models/BirthBash.js')
const favor = require('./Models/Favor.js')
const cors = require('cors')
const auth = require('./Middleware/auth.js')
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
        const checkRoll = await birth.findOne({ RollNo: rollNo }, {})

        if (checkRoll && checkRoll.PassChange === "Done") {
            const response = {
                username: checkRoll.Name,
                password: checkRoll.DOB,
                Email: checkRoll.Email,
                auth: "exist-with-passChange"
            }

            return res.json(response)
        }
        else if (checkRoll && checkRoll.PassChange !== "Done") {
            const response = {
                username: checkRoll.Name,
                password: checkRoll.DOB,
                Email: checkRoll.Email,
                auth: "exist-with-no-passChange"
            }

            return res.json(response)
        }
        else if (!checkRoll) {
            const response = {
                auth: "not-exist"
            }

            return res.json(response)
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
    console.log(rollNo, password)

    try {
        let token;
        if (!rollNo || !password) {
            const response = {
                auth: "Invalid"
            }
            return res.json(response)
        }

        const checkRoll = await birth.findOne({ RollNo: rollNo }, {})
        const pass = await bcrypt.compareSync(password, checkRoll.Password)
        console.log(pass)
        if (pass) {
            token = await checkRoll.generateAuthToken2();
            console.log("token", token)
            res.cookie("jwt", token, {
                secure: true,
                sameSite: 'none',
            })
            const response = {
                auth: "valid",
                roll: checkRoll.RollNo,
                username: checkRoll.Name,
            }
            res.json(response)
        }
        else {
            const response = {
                auth: "Invalid",
            }
            console.log("Invalid2")
            res.json(response)
        }
    }
    catch (err) {
        console.log(err)
    }
})

app.post('/checkDate', async (req, res) => {
    const liveDate = req.body.todayDate;

    const users = await birth.find({ Matcher: liveDate });
    console.log(users);
    return res.json(users);
})

app.get('/search', async (req, res) => {
    const usersList = await birth.find({});
    // console.log(usersList);
    return res.json(usersList)
})

app.post('/EmailVer', async (req, res) => {
    const email = req.body.email;
    const roll = req.body.rollNo;

    const checkRoll = await birth.findOne({ RollNo: roll }, {});
    console.log(checkRoll.Email)

    if (checkRoll) {
        if (checkRoll.Email === email) {
            try {
                const min = 10000;
                const max = 99999;
                const verifyCode = Math.floor(Math.random() * (max - min + 1)) + min;
                const code = verifyCode.toString();
                await checkRoll.updateOne({ Auth: code });
                let transporter = await nodemailer.createTransport({
                    host: `${process.env.HOST}`,
                    port: process.env.SMTP_PORT,
                    authMethod: 'plain',
                    auth: {
                        user: `${process.env.USER}`,
                        pass: `${process.env.PASS}`
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });

                //send mail

                let info = await transporter.sendMail({
                    from: '"PageRoll" <Gp4444> ',
                    to: `${email}`,
                    subject: `PageRoll: Email Verification Code`, // Subject line
                    // text: `Your email verification code is ${verifyCode}`,
                    html: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Document</title>
                    </head>
                    <body>
                        <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2;">
                            <div style="margin: 50px auto; width: 90%; padding: 20px 0;">
                              <div style="border-bottom: 1px solid #eee;">
                                <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600;">PAGEROLL | beta</a>
                              </div>
                              <p>Thank you for choosing Pageroll. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                              <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${verifyCode}</h2>
                              <p style="font-size: 0.9em;">Enter OTP for validation<br />Happy surfing</p>
                              <hr style="border: none; border-top: 1px solid #eee;" />
                            </div> 
                          </div>
                    </body>
                    </html>
                    `
                })

                console.log("Message sent: %s", info.messageId);
                return res.json("exist")
            } catch (err) {
                console.log("Mail does not sent", err)
            }
        }
    }
})

app.post('/changePass', async (req, res) => {
    const pass = req.body.b;
    const roll = req.body.a;
    // console.log("pass change reached")
    const checkRoll = await birth.findOne({ RollNo: roll }, {});
    console.log("pass change reached",)


    if (checkRoll) {
        let token;
        try {
            const salt = 10;
            const passwordHash = await bcrypt.hash(pass, salt);
            console.log(passwordHash, salt);
            await checkRoll.updateOne({ PassChange: "Done" })
            await birth.updateOne({ RollNo: roll }, { $unset: { Password: 1, id: 0 } })
            await checkRoll.updateOne({ Password: passwordHash })
            await checkRoll.updateOne({ unid: roll })
            token = await checkRoll.generateAuthToken2();
            res.cookie("jwt", token, {
                secure: true,
                sameSite: 'none',
            })
            const resp = {
                auth: "passChanged",
                username: checkRoll.Name,
                roll: checkRoll.RollNo,
                branch: checkRoll.Branch
            }
            res.json(resp);
        } catch (err) { console.log(err) }

    }
})

app.post('/likeFunc', async (req, res) => {
    const { uuid } = req.body;

})

app.post('/verifyCode', async (req, res) => {
    const code = req.body.email;
    const roll = req.body.rollNo;

    const checkRoll = await birth.findOne({ RollNo: roll }, {});
    // const str =checkRoll.Auth;
    // const codeStr = str.toString();
    console.log(checkRoll.Auth, code)

    if (checkRoll) {
        if (checkRoll.Auth === code) {
            await birth.updateOne({ RollNo: roll }, { $unset: { Auth: 1, id: 0 } })
            console.log("exist")
            const resp = {
                auth: "exist",
                username: checkRoll.Name,
                roll: checkRoll.RollNo,
            }
            res.json(resp)
        }
        else {
            await birth.updateOne({ RollNo: roll }, { $unset: { Auth: 1, id: 0 } })
            res.json("not-exist")
        }
    }
})

app.post('/mailSender', async (req, res) => {
    const { Name, msg, Branch, Year } = req.body;
    let user = req.body.Name;
    let msgs = req.body.msg;
    let branch = req.body.Branch;
    let year = req.body.Year;
    let str = "Hello Happy birthday";

    try {
        let transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            authMethod: 'plain',
            auth: {
                user: `${process.env.USER}`,
                pass: `${process.env.PASS}`
            }
        });

        //send mail

        let info = await transporter.sendMail({
            from: '"BirthBash" <Gp4444> ',
            to: "gp43883@gmail.com",
            subject: `${user} have wished you`, // Subject line
            text: `${msgs}`
        })

        console.log("Message sent: %s", info.messageId);
        return res.json(info)
    } catch (err) {
        console.log("Mail does not sent")
    }
})

app.post('/addFavorite', async (req, res) => {
    const roll = req.body.roll;
    const searchedUser = req.body.Name;
    console.log(roll, searchedUser)
    const checkRoll = await favor.findOne({ RollNo: roll }, { id: 1, Favorite: 1 });
    console.log(checkRoll);
    if (!checkRoll) {
        const updatedRec = await favor.updateOne({ Favorite: { Name: searchedUser } });
        console.log(updatedRec)
    }
    else if (checkRoll) {
        const insertRec = await favor.updateOne({ RollNo: roll }, { $addToSet: { Favorite: [{ Name: searchedUser }] } });
        console.log(insertRec)
    }


    return res.json("done")
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
    console.log("1")
    res.status(200).send('User Logout');

})

app.listen(PORT, () => {
    console.log("PORT connected")
})
