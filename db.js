const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI

const connectToMongo = () => {
  mongoose.connect(uri, { useNewUrlParser: true }, () => {
    console.log("connected to mongo successully");
  });
};
module.exports = connectToMongo;