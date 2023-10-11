/**
 * Loads the environment variables and starts the server.
 */
require("dotenv").config()

const express = require("express")
const tasks = require("./tasks.js")
const call = require("./call.js")
const fs = require("fs")
const node = require("hyper-ipc-secure")()
const db = require('hypebee')
/**
 * Creates a folder if it doesn't exist.
 * @param {string} folderPath - The path of the folder.
 */
function createFolderIfNotExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    // If the folder doesn't exist, create it
    fs.mkdirSync(folderPath)
    console.log(`Folder "${folderPath}" created.`)
  } else {
    console.log(`Folder "${folderPath}" already exists.`)
  }
}

createFolderIfNotExists("saves")

const app = express()
const port = process.env.PORT || 3011

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use("/task", tasks(node, db))
app.use("/run", call(node))

app.listen(port, (() => {
  console.log(`Example app listening on port ${port}`)
}))
app.use(function (err, req, res, next) {
  res
    .status(err.status || 500)
    .send({ message: err.message, stack: err.stack })
});