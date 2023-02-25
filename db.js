const mongoose = require("mongoose");

const port = "mongodb://localhost:27017";

const connectToMongo = () => {
  mongoose.connect(port, { useNewUrlParser: true }, () => {
    console.log("connected to mongo successully");
  });
};
module.exports = connectToMongo;
