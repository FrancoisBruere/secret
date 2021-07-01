//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
// const encrypt = require("mongoose-encryption"); changed for MD5
// const md5 = require("md5"); changed for bcrypt
// const bcrypt = require("bcrypt"); removed to use passport
// const saltRounds = 10; removed to use passport

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));

// have to placed here -for passport
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
// for passport
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

// used for hash and salt password and save users
userSchema.plugin(passportLocalMongoose);


// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
res.render("home");
});

app.get("/login", function(req, res){
res.render("login");
});

app.get("/register", function(req, res){
res.render("register");
});

app.get("/secrets", function(req, res){
// check if user is logged in and render page
 if(req.isAuthenticated()){
   res.render("secrets");
 }else{
   res.redirect("/login");
 }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){

User.register({username: req.body.username}, req.body.password, function(err, user){
  if(err){
    console.log(err);
    res.redirect("/register");
  }else{
    passport.authenticate("local")(req, res, function(){
      res.redirect("/secrets");
    });
  }
});
});

//removed and recreated to use passport
// app.post("/register", function(req, res){
//   bcrypt.hash(req.body.password, saltRounds, function(err, hash){
//     const newUser = new User({
//       email: req.body.username,
//     //password: req.body.password
//     //password: md5(req.body.password) changed to use bcrypt
//       password: hash
//     });
//     newUser.save(function(err){
//       if(err){
//         console.log(err);
//       }else{
//         res.render("secrets");
//       }
//     });
//   })
// });

app.post("/login", function(req, res){

const user = new User({
  username: req.body.username,
  passowrd: req.body.password
});

req.login(user, function(err){
  if(err){
    console.log(err);
  }else{
    passport.authenticate("local")(req, res, function(){
      res.redirect("/secrets");
    });
  }
});
});

// removed and recreated to use passport
// app.post("/login", function(req, res){
//   const username = req.body.username;
//   const password = req.body.password;
//   //const password = md5(req.body.password); removed to use bcrypt
//
//   User.findOne({email: username}, function(err, foundUser){
//     if(err){
//       console.log(err);
//     }else{
//       if(foundUser){
//         bcrypt.compare(password, foundUser.password, function(err, result){
//           if(result === true){
//               res.render("secrets");
//           }
//         });
//         //if(foundUser.password === password){
//           //res.render("secrets");
//         //}
//       }
//     }
//   });
// });



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
