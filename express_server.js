const express = require("express");
const randomstring = require("randomstring");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca", 
  "9sm5xK": "http://www.google.com"
};
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
  username: req.cookies["username"],
};
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
const longURL =  urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL",(req, res) => {
  if(urlDatabase[req.params.shortURL]){
  const longURL = urlDatabase[req.params.shortURL];  
  const templateVars = {shortURL: req.params.shortURL, longURL: longURL, username: req.cookies["username"]};
  res.render("urls_show", templateVars);
  }
  else{
    res.redirect("/urls");
  }
});
function generateRandomString(number) {
  return randomstring.generate(number);
  }
  
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

app.post("/login", (req, res) => {
  res.cookie("username",req.body.username)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls");
});



