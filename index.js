const connectToMongo = require("./db");
connectToMongo();

const express = require("express");
const app = express();
const port = 3300;
var cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/post", require("./routes/post"));
app.use("/api/comment", require("./routes/comment"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
