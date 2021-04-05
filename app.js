const express = require("express");
const app = express();
app.use(express.json());
const {
  models: { User },
} = require("./db");
const path = require("path");
const jwt = require("jsonwebtoken");

// const secret_key = 'test_secret_key'
const secret_key = process.env.JWT
//const token = jwt.sign({userId: 'lucy'}, secret_key)
// const verifyGood = jwt.verify(token, secret_key)
// const verifyBad = jwt.verify(token, secret_key)
// const userId = num
// const token = jwt.sign({userId: num}, secret_key)

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/auth", async (req, res, next) => {
  try {
    const userId = await User.authenticate(req.body)
    res.send({ token: await jwt.sign(userId, secret_key)})
  } catch (ex) {
    next(ex);
  }
});


app.get("/api/auth", async (req, res, next) => {
  try {
    res.send(await User.byToken(req.headers.authorization));
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
