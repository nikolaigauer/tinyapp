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
    username: req.cookies["username"]
    };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// app.get("/urls/:id/show", (req, res) => {
//   const templateVars = {shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
//   res.render("urls_show", templateVars);
// });
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
res.redirect("/urls")
});

app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_registration", templateVars)
});

function isEmailTaken(email) {
  for (var userID in users) {
    if ( email === users[userID].email) {
      return true;
    }
  }
  return false;
}

app.post("/register", (req, res) => {
  let password = req.body.password
  let email = req.body.email
  let userID = rando()
   if (!req.body.password || !req.body.email) {
    console.log("400 error");
    res.status(400).send('You goofed! Please input a valid email and password');
  } else if (isEmailTaken(email)) {
    console.log("400 error");
    res.status(400).send("Email already registered!");
  } else {
  users[userID] = {id: userID, email: email, password: password}
  res.cookie("user_ID", req.body.email)
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
    username: req.cookies["username"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
  // res.redirect(urlDatabase[req.params.id]);  // <------ redirecting to the URL rather than rendering a show page
});

app.post("/urls/:id", (req, res) => {
  var newLongURL = req.body.longURL;
  urlDatabase[newLongURL]
  // remember error checking
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  var shortURL = rando();
  var longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(req.body.longURL);
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
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});