const mongoose = require("mongoose")
const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String
})
const UserModel = new userSchema("userdata", userSchema)
module.exports = { UserModel }