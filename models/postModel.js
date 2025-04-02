const mongoose = require("mongoose")
const postSchema = mongoose.Schema({
    name: String,
    email: String,
    destination: String,
    travellers: Number,
    budget: Number
})
const PostModel = new postSchema("postdata", postSchema)
module.exports = { PostModel }