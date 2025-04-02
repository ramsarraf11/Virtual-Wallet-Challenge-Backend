const jwt = require("jsonwebtoken")
require("dotenv").config()
async function authenticate(req, res, next) {
    try {
        let token = req.headers.authorization
        if (token) {
            let decoded = jwt.verify(process.env.secretKey, token)
            if (decoded) {
                next()
            } else {
                res.send("Please check login information")
            }
        } else {
            res.send("Please register")
        }
    } catch (error) {
        res.send(error)
    }
}

module.exports={authenticate}