const express = require('express')
const path = require('path')
const {spawn} = require('child_process');
const readline = require('readline');
const fs = require('fs')
var session = require('express-session')
var bodyParser = require('body-parser')
const xlsx = require("xlsx");

const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ port: 8081 });

const app = express()

app.use(bodyParser.json())
var sessionParser = session({ secret: 'keyboard cat',saveUninitialized: true,resave: true, cookie: { maxAge: 10 * 365 * 24 * 60 * 60 }})
app.use(sessionParser)

app.use('/', express.static(path.join(__dirname, '../public')))

app.get('/getSet', (req, res) => {

	let set = req.query.set
	let spreadsheet = xlsx.readFile(path.join(__dirname, 'db/'+set+'.xlsx'));
	res.json({set: spreadsheet})
})

app.post('/saveSet', (req, res) => {
	let setting = req.body.setting;
	let spreadsheet = req.body.spreadsheet;

	xlsx.writeFile(spreadsheet, path.join(__dirname, 'db/'+setting+'.xlsx'))
	res.json({"status":"OK"})
})


module.exports = app