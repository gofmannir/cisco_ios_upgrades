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


wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		console.log('received: %s', message);

		if(message.includes('getState')){
			let recordId = message.split('---')[1]
			let data = fs.readFileSync(path.join(__dirname, '/logs/' + recordId + '.txt'),{encoding:'utf8'})
			ws.send('recordState---' + data);
		}
	});
   
	ws.on('close', function() {
		console.log('Closed Connection 😱');
	});
	
})

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

const new_record = (params, recordId) => {
	console.log('req.session.params', params)
	let args = [path.join(__dirname, '/python/send_config_2.py'), recordId]
	const python = spawn('python3', args);

	python.stdout.on('data', function (data) {
		console.log("running...")
	});
	python.stderr.on('data', function (data) {
		console.log("err", data.toString())
		console.log("broken...")
		fs.writeFile(path.join(__dirname, '/logs/' + recordId + '.txt'), 'broken', function(err){
			if (err) throw err;
			console.log('Saved!');
		})
	});
	
	python.on('close', (code) => {
		console.log(`child process close all stdio with code ${code}`)
		
	})
}

app.post('/newRecord', (req, res) => {
	let data = req.body.data

	var rand = function() {
		return Math.random().toString(36).substr(2)
	};
	
	var token = function() {
		return rand() + rand()
	};
	
	let recordId = token()
	
	req.session.params = data
	res.json({
		'status':"OK",
		'recordId':recordId
	})
	new_record(req.session.params, recordId)

	fs.writeFile(path.join(__dirname, '/logs/' + recordId + '.txt'), 'running', function(err){
		if (err) throw err;
		console.log('Saved!');
	})
})
app.post('/newRecord_external', (req, res) => {
	let data = req.body.data

	var rand = function() {
		return Math.random().toString(36).substr(2)
	};
	
	var token = function() {
		return rand() + rand()
	};
	
	let recordId = token()
	
	if(req.session.params){

		req.session.params.selectionType = data.selectionType
		req.session.params.scanAdd = data.scanAdd
		req.session.params.showOnlyOutput = data.showOnlyOutput

		res.json({
			'status':"OK",
			'recordId':recordId
		})
	
		new_record(req.session.params, recordId)
	
		fs.writeFile(path.join(__dirname, '/logs/' + recordId + '.txt'), 'running', function(err){
			if (err) throw err;
			console.log('Saved!');
		})
	}else{
		res.json({
			'status':"err",
			'str':'No User',
			'recordId':'0'
		})
	}

})

app.get('/records/:id', (req, res) => {
	let data = fs.readFileSync(path.join(__dirname, '/logs/' + req.params.id + '.txt'),{encoding:'utf8'})
	if(data){
		res.json({
			'status':'OK',
			'recordState':data
		})
	}else{
		res.json({
			'status':'err'
		})
	}
})

app.get('/getRecordOutput/:id', (req, res) => {
	let data = fs.readFileSync(path.join(__dirname, '/records/' + req.params.id + '.txt'),{encoding:'utf8'})
	if(data){
		res.json({
			'status':'OK',
			'record':data
		})
	}else{
		res.json({
			'status':'err'
		})
	}
})


module.exports = app