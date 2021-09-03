const express = require("express");
const bcrypt = require('bcrypt');

const randomstring = require("randomstring");
const lodash = require('lodash');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieParser())

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
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls",(req, res) => {
  
  if(req.cookies["user_id"]){
    const templateVars ={
      urls: urlsForUser(req.cookies["user_id"]),
      user: findUserObject(req.cookies["user_id"]),
    };
    console.log(users);
    res.render("urls_index", templateVars);
}
else{
  res.redirect("/login");
}
});
app.get("/urls/new", (req, res) => {           
  const templateVars = {user: findUserObject(req.cookies["user_id"])}
  if(findUserObject(req.cookies["user_id"])){
    res.render("urls_new", templateVars);
  }
  else{
     res.redirect("/login");
  }
});


app.get("/urls/:shortURL",(req, res) => {  
  if(urlDatabase[req.params.shortURL]){
  const longURL = urlDatabase[req.params.shortURL].longURL;  
  const templateVars = {shortURL: req.params.shortURL, longURL: longURL, user: findUserObject(req.cookies["user_id"])};
  res.render("urls_show", templateVars);
  }

});

app.get("/u/:shortURL", (req, res) => {
  const longURL =  urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  });
  
app.post("/urls", (req, res) => {
  let randomString = generateRandomString(6);
  urlDatabase[randomString] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  let showURL = `/urls/${randomString}`;
  res.redirect(showURL);
  //res.send(randomString);         // Respond with 'Ok' (we will replace this)
});


app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"] && (urlDatabase[req.params.shortURL].userID === req.cookies["user_id"])){
  delete urlDatabase[req.params.shortURL];
  res.status(400);
  res.redirect("/urls");
  } else if(!urlDatabase[req.params.shortURL]){
    res.status(400);
    res.send('<p> That URL does not exist </p>');
  } else if((req.cookies["user_id"]) &&  (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"])){
    res.status(400);
    res.send('<p> That URL does not belong to you </p>');
  } else if(!req.cookies["user_id"]){
    res.status(400);
    res.send('<p> You need to log in first </p>');
  } else{
    res.status(400);
    res.send('<p> Unknown error </p>');
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.cookies["user_id"] && (urlDatabase[req.params.shortURL].userID === req.cookies["user_id"])){
  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  res.redirect("/urls"); } else if(!urlDatabase[req.params.shortURL]){
    res.status(400);
    res.send('<p> That URL does not exist </p>');
  } else if((req.cookies["user_id"]) &&  (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"])){
    res.status(400);
    res.send('<p> That URL does not belong to you </p>');
  } else if(!req.cookies["user_id"]){
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
  let newUser = {id: randomUserId, email: req.body.email, password: bcrypt.hashSync(req.body.password, 5)}
  users[randomUserId] = newUser;
  res.cookie("user_id", randomUserId);
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
  if(users[id]){
    return users[id];
  }
}

const urlsForUser = function (userID){
  let userURLs = lodash.cloneDeep(urlDatabase); 
  for(const urlObject in userURLs){
    if(userURLs[urlObject].userID !== userID){
      delete userURLs[urlObject];  //Delete the keys that do not match. We are deleting from a copy of the original object.
    }
  }
  return userURLs;
};

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
      if (bcrypt.compareSync(password, users[userId].password)){
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