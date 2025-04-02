const { Router } = require("express")


const { UserModel } = require("../models/userModel")


const user = Router()


user.get("/getuser", async (req, res) => {
    try {
        let data = await UserModel.find()
        res.send(data)
    } catch (error) {
        res.send(error)
    }
})

user.get("/getuser/:id", async (req, res) => {
    let ID = req.params.id
    try {
        let payload = await UserModel.findOne({ _id: ID })
        res.send(payload)
    } catch (error) {
        res.send(error)
    }
})


user.post("/adduser", async (req, res) => {
    let { email, name, password } = req.body
    try {
        let data = new UserModel({ email, name, password })
        await data.save()
        res.send({ "message": "user added success", user: user })
    } catch (error) {
        res.send(error)
    }
})

user.delete("/deleteuser/:id", async (req, res) => {
    let ID = req.params.id
    let data = await UserModel.findOne({ _id: ID })
    try {
        if (data.length > 0) {
            await UserModel.findByIdAndDelete({ _id: ID })
            res.send(`user with id : ${ID} got deleted`)
        } else {
            res.send("No data available with given ID")
        }
    } catch (error) {
        res.send(error)
    }
})

user.patch("/updateuser/:id", async (req, res) => {
    let ID = req.params.id
    let data = await UserModel.findOne({ _id: ID })
    let payload = req.body
    try {
        if (data.length > 0) {
            await UserModel.findByIdAndUpdate({ _id: ID }, payload)
            res.send(`user with id : ${ID} got Updated`)
        } else {
            res.send("No data available with given ID")
        }
    } catch (error) {
        res.send(error)
    }
})


module.exports = { user }