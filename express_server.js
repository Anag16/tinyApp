const express = require("express");
const randomstring = require("randomstring");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieParser())



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls",(req, res) => {
  const templateVars ={
    urls: urlDatabase ,
    user: findUserObject(req.cookies["user_id"]),
};
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {user: findUserObject(req.cookies["user_id"])}
  res.render("urls_new", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
const longURL =  urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL",(req, res) => {
  if(urlDatabase[req.params.shortURL]){
  const longURL = urlDatabase[req.params.shortURL];  
  const templateVars = {shortURL: req.params.shortURL, longURL: longURL, user: findUserObject(req.cookies["user_id"])};
  res.render("urls_show", templateVars);
  }
  else{
    res.redirect("/urls");
  }
});
  
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let randomString = generateRandomString(6);
  urlDatabase[randomString] = req.body.longURL;
  let showURL = `/urls/${randomString}`;
  res.redirect(showURL);
  //res.send(randomString);         // Respond with 'Ok' (we will replace this)
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls");
});

app.get("/urls/:shortURL/edit", (req, res) => {
  console.log(req.params);
  res.redirect("/urls/:shortURL");
});

app.get("/login", (req, res) => {
  const templateVars = {user: findUserObject(req.cookies["user_id"])}
  res.render('login', templateVars);
});

app.post("/login", (req, res) => {
  if (req.body.email.length === 0 || req.body.password.length === 0){
    const templateVars = {user: ''};
    res.status(400);
    res.send('Incomplete information');
    // res.render("register", templateVars);
  }
  else if(isEmailAvailable(req.body.email)){
    const templateVars = {user: ''};
    res.status(403);
    res.send('There is no account associated with that email');
  } else if (!isPasswordValid(req.body.email, req.body.password)){
    const templateVars = {user: ''};
    res.status(403);
    res.send('Invalid password');
  }
  else{
      let userID = isPasswordValid(req.body.email, req.body.password);
      res.cookie("user_id",userID);
      res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register",(req, res) =>{
  const templateVars = {user: findUserObject(req.cookies["user_id"])}
  res.render("register", templateVars);
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
  else if(isEmailAvailable(req.body.email)){
  let newUser = {id: randomUserId, email: req.body.email, password: req.body.password}
  users[randomUserId] = newUser;
  res.cookie("user_id", randomUserId);
  console.log(users);
  console.log(req.cookies["user_id"]);
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

let findUserObject = function(id){
  console.log('Looking for ' + id);
  if(users[id]){
    console.log('Found user');
    return users[id];
  }
}

let isEmailAvailable = function (email){
  for (let userId in users){
    if (users[userId].email === email){
      console.log('Email already taken');
      return false;
    }
  }
  return true;
}

let isPasswordValid = function(email, password){
  for (let userId in users){
    if (users[userId].email === email){
      if (users[userId].password === password){
        console.log('Valid password');
        return users[userId].id; //Returning the id also works as returning true. 
      }
      else{
        console.log('Invalid password');
        return false;
      }
  }
}
return false;
}