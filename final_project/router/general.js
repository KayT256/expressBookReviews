const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Simulated async function to fetch books
const fetchBooks = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(books)
  }, 3000)
})

public_users.post("/register", (req, res) => {
  const username = req.body.username
  const password = req.body.password

  if (isValid(username) && isValid(password)) {
    const usersWithSameUsername = users.filter(user => user.username == username)
    if (usersWithSameUsername.length == 0) {
      users.push({
        'username': username,
        'password': password
      })
      return res.status(200).json({ 'message': 'User successfully registred. Now you can login' })
    } else {
      return res.status(404).json({ 'message': 'User already exists!' })
    }
  }

  return res.status(404).json({ 'message': 'Unable to register use. Invalid or missing username or password' })
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  // res.send(JSON.stringify(books, null, 4))

  // // Using Promise Callbacks
  // fetchBooks.then(books => {
  //   res.send(JSON.stringify(books, null, 4))
  // })

  // Using Async/ Await
  const books = await fetchBooks
  res.send(JSON.stringify(books, null, 4))
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn
  // Using Promise Callbacks
  fetchBooks.then(books => {
    res.send(JSON.stringify(books[isbn], null, 4))
  })
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author
  
  // 1. Obtain all the keys for the ‘books’ object.
  const books = await fetchBooks
  const keys = Object.keys(books)

  // 2. Iterate through the `keys` array & check the author matches the one provided in the request parameters.

  // Using reduce
  // const filteredBooks = keys.reduce((booksAccumulator, key) => {
  //   const book = books[key]
  //   if (book['author'] == author) {
  //     booksAccumulator[key] = book
  //   }
  //   return booksAccumulator
  // }, {})

  // Using for loop
  const filteredBooks = {}
  for (const key of keys) {
    const book = books[key]
    if (book['author'] == author) {
      filteredBooks[key] = book
    }
  }

  res.send(JSON.stringify(filteredBooks, null, 4))
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title

  const books = await fetchBooks
  const keys = Object.keys(books)
  const filteredBooks = {}
  for (const key of keys) {
    const book = books[key]
    if (book['title'] == title) {
      filteredBooks[key] = book
    } 
  }

  res.send(JSON.stringify(filteredBooks, null, 4))
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn
  const keys = Object.keys(books)
  const key = keys.filter(key => key == isbn)
  res.send(JSON.stringify(books[key]['reviews'], null, 4))
});

module.exports.general = public_users;
