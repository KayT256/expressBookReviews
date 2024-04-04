const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = username => {
  if (typeof username != 'string') return false
  if (username.length < 3 || username.trim == '') return false
  
  const allowedChars = /^[A-za-z0-9_]+$/
  if (!allowedChars.test(username)) return false

  return true
}

const authenticatedUser = (username, password) => {
  const validUsers = users.filter(user => user.username == username && user.password == password)
  if (validUsers.length > 0) return true

  return false
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username
  const password = req.body.password

  if (!username || !password) return res.status(404).json({ 'message': 'Error logging in' })
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({username}, 'access', { expiresIn: 60 * 60 })

    req.session.authorization = {
      accessToken,
      username
    }

    return res.status(200).send('User successfully logged in');
  }
  
  return res.status(208).json({ 'message': 'Invalid Login. Check username and password' })
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const review = req.query.review
  const book = books[isbn]
  book['reviews'][req.user.username] = review
  res.send(`The review "${review}" has been added/ updated for the book with ISBN ${isbn}`)
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  delete books[isbn]
  res.send(`The review for book with the ISBN ${isbn} has been deleted`)
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
