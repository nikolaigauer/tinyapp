"use strict"
var express = require("express");
var app = express();
// var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt')

var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: "o3rng57fvs8wnolh",
  // keys: [ secret keys ],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const rando = () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const alphabet = letters + numbers + letters.toUpperCase();
  let output = '';
  for(let i = 0; i < 6; i += 1 ){
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return output;
}

let urlDatabase = {
  "b2xVn2": {
    id: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "ran"
  },
  "9sm5xK": {
    id: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "ran"
  }
};



let users = {
  "ran": {
    id: "ran",
    email: "user@example.com",
    password: "do"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/urls", (req, res) => {

  let templateVars = {
    urlDatabase: urlsForUser(req.session["user_ID"]),
    user: req.session["user_ID"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session["user_ID"]]
  };
  if (req.session["user_ID"]) {
    res.render("urls_new", templateVars)
  } else {
    res.render("urls_login", templateVars)
  };
});

app.post("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session["user_ID"]],
    urlDatabase: userID
  };

  res.redirect("/urls/new", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session["user_ID"]]
  };
  if (req.session["user_ID"]) {
    res.redirect("/urls")
  } else {
    res.render("urls_login", templateVars)
  };
});

app.post("/login", (req, res) => {
  let password = req.body.password;
  let email = req.body.email;


  // let saltRounds = 10;
  // var salt = bcrypt.genSaltSync(saltRounds);
  // var hash = bcrypt.hashSync(password, salt);
  // console.log(hash);
  // let hashed_password = (bcrypt.compareSync(password, 10))

//   if (bcrypt.compareSync(password, hash)) {
//   console.log("The password is a match!");
// } else {
//   console.log("You suck at passwords.");
// }
// console.log(bcrypt.compareSync(password, hashed_password)); // hashed_password need to refer to the object it is stored in

  if (!req.body.password || !req.body.email) {
    console.log("403 error");
    res.status(403).send('Please input a valid email and password');
  } else if (!isEmailTaken(email)) {
    console.log("403 error");
    res.status(403).send('The input email is not in our database');
  } else if (passwordCheck(email, password)) { // replaced password with hash
    let user = passwordCheck(email, password);
    req.session.user_ID = user.id; //<---- not defined!! see windows original, have changed
    res.redirect("/urls");
  } else {
    console.log("403 error");
    res.status(403).send("The email and password do not seem to match");
  }
});

app.post("/logout", (req, res) => {
  console.log("Kenny Loggins out");
  req.session = null;
  res.redirect("/login")
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session["user_ID"]]
  }
  res.render("urls_registration", templateVars)
});

app.post("/register", (req, res) => {
  const password = req.body.password; // you will probably this from req.params
  const hashed_password = bcrypt.hashSync(password, 10);
  console.log("this is hashed pw: " + hashed_password);

let saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);
var hash = bcrypt.hashSync(password, salt);
console.log("this is hash: " + hash);
console.log("this is password and hash: " + bcrypt.compareSync(password, hash));

  // let password = req.body.password;
  let email = req.body.email;
  let userID = rando();
  // console.log(passsword, email, userID)
   if (!req.body.password || !req.body.email) {
    console.log("400 error");
    res.status(400).send('You goofed! Please input a valid email and password');
  } else if (isEmailTaken(email)) {
    console.log("400 error");
    res.status(400).send("Email already registered!");
  } else {
  users[userID] = {id: userID, email: email, password: hash}; // <----- changing password to hashed password
  req.session.user_ID = userID;
  console.log(users)
  res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.session["user_ID"] === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id]
    res.redirect("/urls")
  } else {
    res.status(550).send("You can't do that");
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.session["user_ID"] === urlDatabase[req.params.id].userID) {
    let templateVars = {
      user: users[req.session["user_ID"]],
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(550).send("You can't do that");
  }
 });

app.post("/urls/:id", (req, res) => {
  var newLongURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = newLongURL;
  console.log("this is from the post urls :id section: " + urlDatabase[newLongURL]);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  var shortURL = rando();
  let longURL = req.body.longURL; // < ---- input of long URL
  let userID = req.session["user_ID"] // < ---- logged in user's ID
  urlDatabase[shortURL] = {id: shortURL, longURL: longURL, userID: userID};
  console.log(urlDatabase);
  res.redirect("/urls/" + shortURL);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.end(`<html><body>Hello <b>World</b></body></html>\n`);
});

app.get("/", (req, res) => {
  res.end("Hello2!");
});

app.get("/urls.json", (req, res) =>{
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Helper functions below:
function passwordCheck(email, password) {
  for (var userID in users) {
    if (email === users[userID].email) {
      // if (password === users[userID].password) {
      if (bcrypt.compareSync(password, users[userID].password)) {
        return users[userID]; //<----- changed it
      }
    return false;
    }
  }
}
// console.log(bcrypt.compareSync(password, users[userID].password));

function isEmailTaken(email) {
  for (var userID in users) {
    if (email === users[userID].email) {
      return true;
    }
  }
  return false;
}

function urlsForUser(id) {
  let userURLs = {};
  for (var urlKey in urlDatabase) {
    if ( id === urlDatabase[urlKey].userID) {
      userURLs[urlKey] = urlDatabase[urlKey];
    }
  }
  return userURLs;
}