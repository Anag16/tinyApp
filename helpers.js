const lodash = require('lodash');

let findUserObject = function(id, userDatabase){
  if(userDatabase[id]){
    return userDatabase[id];
  }
}

let isPasswordValid = function(bcrypt, email, password, users){
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


const urlsForUser = function (userID, urlDatabase){
  let userURLs = lodash.cloneDeep(urlDatabase); 
  for(const urlObject in userURLs){
    if(userURLs[urlObject].userID !== userID){
      delete userURLs[urlObject];  //Delete the keys that do not match. We are deleting from a copy of the original object.
    }
  }
  return userURLs;
};

let isEmailAvailable = function (email, users){
  for (let userId in users){
    if (users[userId].email === email){
      console.log('Email already taken');
      return false;
    }
  }
  return true;
}

module.exports = {
  findUserObject,
  isPasswordValid,
  urlsForUser,
  isEmailAvailable
}