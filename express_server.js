var express = require("express");
var app = express();
var cookieParser = require('cookie-parser')

var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

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

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}



app.get("/urls", (req, res) => {
  // console.log(req)
  let templateVars = {
    urlDatabase: urlDatabase,
    user: users[req.cookies["user_ID"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_ID"]]
  };
  if (req.cookies["user_ID"]) {
    res.render("urls_new", templateVars)
  } else {
    res.render("urls_login", templateVars)
  };
});

app.post("/urls/new", (req, res) => {
  let templateVars = {

    user: users[req.cookies["user_ID"]],
    urlDatabase: userID


  };

  res.redirect("/urls/new", templateVars);
});

app.get("/login", (req, res) => {
  // let password = req.body.password
  let templateVars = {
    user: users[req.cookies["user_ID"]]
  };
  if (req.cookies["user_ID"]) {
    res.redirect("/urls")
  } else {
    res.render("urls_login", templateVars)
  };
});

app.post("/login", (req, res) => {
  let password = req.body.password
  let email = req.body.email
  if (!req.body.password || !req.body.email) {
    console.log("403 error");
    res.status(403).send('Please input a valid email and password');
  } else if (!isEmailTaken(email)) {
    console.log("403 error");
    res.status(403).send('The input email is not in our database');
  } else if (passwordCheck(email, password)) {
    let user = passwordCheck(email, password)
    res.cookie("user_ID", user.id)
    res.redirect("/urls");
  } else {
    console.log("403 error");
    res.status(403).send("The email and password does not seem to match")
  }
});

app.post("/logout", (req, res) => {
  console.log("Kenny Loggins out")
  res.clearCookie("user_ID")
  res.redirect("/login")
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_ID"]]
  }
  res.render("urls_registration", templateVars)
});

app.post("/register", (req, res) => {
  let password = req.body.password
  let email = req.body.email
  let userID = rando()
  // console.log(passsword, email, userID)
   if (!req.body.password || !req.body.email) {
    console.log("400 error");
    res.status(400).send('You goofed! Please input a valid email and password');
  } else if (isEmailTaken(email)) {
    console.log("400 error");
    res.status(400).send("Email already registered!");
  } else {
  users[userID] = {id: userID, email: email, password: password}
  res.cookie("user_ID", userID)
  console.log(users)
  res.redirect("/urls")
  }
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  console.log(urlDatabase, req.params.id)
  res.redirect("/urls")
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_ID"]],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
  // res.redirect(urlDatabase[req.params.id]);  // <------ redirecting to the URL rather than rendering a show page
});

app.post("/urls/:id", (req, res) => {
  var newLongURL = req.body.longURL;
  urlDatabase[newLongURL]
  console.log("this is from the post urls :id section: " + urlDatabase[newLongURL])
  // remember error checking
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  var shortURL = rando();
  console.log("Short URL: " + shortURL)
  let longURL = req.body.longURL; // < ---- input of long URL
  urlDatabase[shortURL] = longURL; // <---- this makes the key shortURL and the value longURL
  let urlPair = urlDatabase[shortURL][longURL] // don't think this does anything
  let userID = req.cookies["user_ID"] // < ---- logged in user's ID
    console.log("urlPair: " + urlPair)
  // urlDatabase[userID] = uniqURLDatabase /// what is this doing?
  urlDatabase[userID] = {} // Pushing an object into urlDatabase?
  urlDatabase[userID][shortURL] = longURL // pushing an object AND a key value pair into urlDatabase
  console.log("long URL: " + longURL); // < ------ input of new URL
  console.log("userID: " + userID)
  console.log("urlDatabase[userID]: " + urlDatabase[userID])

  // users[userID] = {id: userID, email: email, password: password}


  console.log(urlDatabase)
  res.redirect("/urls/" + shortURL);

});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
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

function passwordCheck(email, password) {
  for (var userID in users) {
    if (email === users[userID].email) {
      if (password === users[userID].password) {
        return users[userID];
      }
    return false;
    }
  }
}

function isEmailTaken(email) {
  for (var userID in users) {
    if (email === users[userID].email) {
      return true;
    };
  }
  return false;
}

function urlsForUser(id) {

}