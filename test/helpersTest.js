const { assert } = require('chai');

const { findUserObject } = require('../helpers.js');

const testUsers = {
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
};

describe('findUserByID', function() {
  it('should return the user id if FOUND', function() {
    const userID = findUserObject("user2RandomID", testUsers).id;
    const expectedOutput = "user2RandomID";
        // Write your assert statement here
    assert.equal(userID, expectedOutput, `${userID} should be equal to ${expectedOutput}`);
  });

  it('Return undefined if the user is not found', function() {
    const user2ID = findUserObject("user2RandomID2", testUsers)
    const expected2Output = undefined;
        // Write your assert statement here
    assert.equal(user2ID, expected2Output, `${user2ID} should be equal to ${expected2Output}`);
  });
});
