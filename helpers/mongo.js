const mongoose = require("mongoose")

module.exports = (req, res, next) => {
    mongoose.connect("mongodb://127.0.0.1:27017/BackEnd").catch((err) => {
        console.log("Error ao conectar no banco:", err)
    })
    return next()
}
