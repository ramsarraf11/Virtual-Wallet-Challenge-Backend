const { Router } = require("express")


const { PostModel } = require("../models/postModel")


const post = Router()


post.get("/allpost", (req, res) => {
    res.send("all post data")
})





module.exports = { post }