const express = require("express");
const bcrypt = require('bcrypt');
let cookieSession = require('cookie-session');
let helpers = require('./helpers');

const randomstring = require("randomstring");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['myTinyAppWebApp', 'myTinyAppWebApp2']
}));

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const saltRounds = 5;
const salt = bcrypt.genSaltSync(saltRounds);

const user1Password = bcrypt.hashSync("pockpock", salt);
const user2Password = bcrypt.hashSync("hydrogen", salt);

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: user1Password
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: user2Password
  }
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`TynyApp listening on port ${PORT}!`);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls",(req, res) => {

  if(req.session.user_id){
    if (!helpers.findUserObject(req.session.user_id, users)){
      console.log('Clearing invalid sessions/cookies');
      req.session = null;
      res.redirect("/login");
    }

    const templateVars ={
      urls: helpers.urlsForUser(req.session.user_id, urlDatabase),
      user: helpers.findUserObject(req.session.user_id, users),
    };
    
    console.log(users);
    res.render("urls_index", templateVars);
}
else{
  res.redirect("/login");
}
});
app.get("/urls/new", (req, res) => {           
  const templateVars = {user: helpers.findUserObject(req.session.user_id, users)}
  if(helpers.findUserObject(req.session.user_id, users)){
    res.render("urls_new", templateVars);
  }
  else{
     res.redirect("/login");
  }
});


app.get("/urls/:shortURL",(req, res) => {  
  if(urlDatabase[req.params.shortURL]){
  const longURL = urlDatabase[req.params.shortURL].longURL;  
  const templateVars = {shortURL: req.params.shortURL, longURL: longURL, user: helpers.findUserObject(req.session.user_id, users)};
  res.render("urls_show", templateVars);
  }

});

app.get("/u/:shortURL", (req, res) => {
  console.log(`The long URL is ${urlDatabase[req.params.shortURL].longURL} and the shortURL is ${req.params.shortURL}`);
  console.log(urlDatabase);
  let longURL =  urlDatabase[req.params.shortURL].longURL;
  if (!longURL.includes('http')){
    longURL = `https://${longURL}`;
  }
  res.redirect(longURL);
  });
  
app.post("/urls", (req, res) => {
  let randomString = generateRandomString(6);
  let long_URL = req.body.longURL;
  if (!req.body.longURL.includes('http')){
    long_URL = `https://${long_URL}`;
  }
  urlDatabase[randomString] = {longURL: long_URL, userID: req.session.user_id};
  let showURL = `/urls/${randomString}`;
  res.redirect(showURL);
  //res.send(randomString);         // Respond with 'Ok' (we will replace this)
});


app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id && (urlDatabase[req.params.shortURL].userID === req.session.user_id)){
  delete urlDatabase[req.params.shortURL];
  res.status(400);
  res.redirect("/urls");
  } else if(!urlDatabase[req.params.shortURL]){
    res.status(400);
    res.send('<p> That URL does not exist </p>');
  } else if((req.session.user_id) &&  (urlDatabase[req.params.shortURL].userID !== req.session.user_id)){
    res.status(400);
    res.send('<p> That URL does not belong to you </p>');
  } else if(!req.session.user_id){
    res.status(400);
    res.send('<p> You need to log in first </p>');
  } else{
    res.status(400);
    res.send('<p> Unknown error </p>');
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.session.user_id && (urlDatabase[req.params.shortURL].userID === req.session.user_id)){
  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  res.redirect("/urls"); } else if(!urlDatabase[req.params.shortURL]){
    res.status(400);
    res.send('<p> That URL does not exist </p>');
  } else if((req.session.user_id) &&  (urlDatabase[req.params.shortURL].userID !== req.session.user_id)){
    res.status(400);
    res.send('<p> That URL does not belong to you </p>');
  } else if(!req.session.user_id){
    res.status(400);
    res.send('<p> You need to log in first </p>');
  } else{
    res.status(400);
    res.send('<p> Unknown error </p>');
  }
});

app.get("/urls/:shortURL/edit", (req, res) => {
  res.redirect("/urls/:shortURL");
});

app.get("/login", (req, res) => {
  const templateVars = {user: helpers.findUserObject(req.session.user_id, users)}
  if(req.session.user_id){
    res.redirect("/urls");
  } else{
    res.render('login', templateVars);
  }
});

app.post("/login", (req, res) => {
  const templateVars = {user: ''};
  if (req.body.email.length === 0 || req.body.password.length === 0){
    res.status(400);
    res.send('Incomplete information');
    // res.render("register", templateVars);
  }
  else if(helpers.isEmailAvailable(req.body.email, users)){
    res.status(403);
    res.send('There is no account associated with that email');
  } else if (!helpers.isPasswordValid(bcrypt, req.body.email, req.body.password, users)){
    res.status(403);
    res.send('Invalid password');
  }
  else{
      let userID = helpers.isPasswordValid(bcrypt, req.body.email, req.body.password, users);
      req.session.user_id = userID;
      res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register",(req, res) =>{
  const templateVars = {user: helpers.findUserObject(req.session.user_id, users)}
  if(req.session.user_id){
    res.redirect("/urls");
  } else{
    res.render('register', templateVars);
  }
});

app.post("/register",(req, res) =>{
  let randomUserId = generateRandomString(8);
  // req.body.email comes from the form field called email in register.ejs
  // req.body.password comes from the form field called password in register.ejs
  if (req.body.email.length === 0 || req.body.password.length === 0){
    const templateVars = {user: ''};
    res.status(400);
    res.send('Incomplete information');
    // res.render("register", templateVars);
  }
  else if(helpers.isEmailAvailable(req.body.email, users)){
  let newUser = {id: randomUserId, email: req.body.email, password: bcrypt.hashSync(req.body.password, 5)}
  users[randomUserId] = newUser;
  req.session.user_id = randomUserId;
  res.redirect("/urls");
  }
  else{
    //Email taken
    res.status(400);
    res.send('Email already taken');
  }
})





// ############# FUNCTIONS ###############
function generateRandomString(number) {
  return randomstring.generate(number);
}



