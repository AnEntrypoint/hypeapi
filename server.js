require('dotenv').config()
const express = require('express')
const tasks = require( './tasks.js')
const run = require( './run.js')
const fs = require( 'fs')
const ipc = require( 'hyper-ipc-secure')
const node = ipc()

function createFolderIfNotExists(folderPath) {
    if (!fs.existsSync(folderPath)) {
        // If the folder doesn't exist, create it
        fs.mkdirSync(folderPath);
        console.log(`Folder "${folderPath}" created.`);
    } else {
        console.log(`Folder "${folderPath}" already exists.`);
    }
}
createFolderIfNotExists('saves');
const app = express()
const port = process.env.PORT || 3011
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'https://svelvet.lan.247420.xyz');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
const kp = {publicKey:Buffer.from(process.env.PUBLICKEY, 'hex')}
app.use('/task', tasks(node, kp))
app.use('/run', run(node, kp))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
