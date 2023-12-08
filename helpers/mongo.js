const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI;

module.exports = (req, res, next) => {
    mongoose.connect(mongoURI).catch((err) => {
        console.log("Erro ao conectar no banco:", err);
    });
    return next();
};
