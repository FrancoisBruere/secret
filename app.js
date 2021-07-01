//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
// const encrypt = require("mongoose-encryption"); changed for MD5
// const md5 = require("md5"); changed for bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});


// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User",userSchema);


app.get("/", function(req, res){
res.render("home");
});

app.get("/login", function(req, res){
res.render("login");
});

app.get("/register", function(req, res){
res.render("register");
});

app.post("/register", function(req, res){
  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    const newUser = new User({
      email: req.body.username,
    //password: req.body.password
    //password: md5(req.body.password) changed to use bcrypt
      password: hash
    });
    newUser.save(function(err){
      if(err){
        console.log(err);
      }else{
        res.render("secrets");
      }
    });
  })
});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  //const password = md5(req.body.password); removed to use bcrypt

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        bcrypt.compare(password, foundUser.password, function(err, result){
          if(result === true){
              res.render("secrets");
          }
        });
        //if(foundUser.password === password){
          //res.render("secrets");
        //}
      }
    }
  });
});










app.listen(3000, function() {
  console.log("Server started on port 3000");
});
