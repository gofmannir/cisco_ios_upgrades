
var _DATA = {
	"routers":[
		{
			"name":"P1",
			"ip":"123.123.123.123"
		},
		{
			"name":"N1",
			"ip":"123.123.123.123"
		},
		{
			"name":"A3",
			"ip":"123.123.123.123"
		},
		{
			"name":"B3",
			"ip":"123.123.123.123"
		}
	],
	"protocols":[
		{
			"name":"OSPF"
		},
		{
			"name":"MPLS"
		},
		{
			"name":"PING"
		},
		{
			"name":"CDP"
		},
		{
			"name":"E.In"
		},
		{
			"name":"E.Out"
		}
	]
}

var routersSelectedChecks = {}
var protocolsSelectedChecks = []
var loginObj = {}

function renderRoutersChecks(){
	let html = _DATA.routers.map(r => {
		return `
			<div class='option'>
				<label for='check_${r.name}'>${r.name}</label>
				<input type='checkbox' id='check_${r.name}' />
			</div>
		`
	})

	$('#step1 .options').html(html)
}
function renderProtocolsChecks(){
	let html = _DATA.protocols.map(r => {
		return `
			<div class='option'>
				<label for='check_${r.name}'>${r.name}</label>
				<input type='checkbox' id='check_${r.name}' />
			</div>
		`
	})

	$('#step2 .options').html(html)
}

$(document).ready(function(){
	renderRoutersChecks()
	renderProtocolsChecks()

	$(document).on({
		click: function(e){
			e.preventDefault()
			if($(this)[0].classList.contains('selected_option')){
				$(this).removeClass('selected_option')
				this.querySelector('input').checked = false
			}else{
				$(this).addClass('selected_option')
				this.querySelector('input').checked = true
			}
		}
	}, '.option')
	
	var selectionType = 'segment'
	$('#groupBtn').click(() => {
		$('.mainScreen').hide()
		$('.setGroupSection').fadeIn()
	})
	$('#continuebtn').click(() => {
		$('.mainScreen').hide()
		$('#backStep').data('step', 'segment')
		$('.setGUserSection').fadeIn()
		selectionType = 'segment'
	})
	$('#backToMainBtn').click(() => {
		$('.setGroupSection').hide()
		$('.mainScreen').fadeIn()
	})
	$('#finishGroupSetBtn').click(() => {
		//TODO verify textarea format

		$('.setGroupSection').hide()
		$('#backStep').data('step', 'group')
		$('.setGUserSection').fadeIn()
		selectionType = 'group'
	})

	$('#backStep').click(() => {
		if($('#backStep').data('step') == 'group'){
			$('.setGUserSection').hide()
			$('.setGroupSection').fadeIn()
		}else{
			$('.setGUserSection').hide()
			$('.mainScreen').fadeIn()
		}
	})

	$('#step1 button').click(() => {
		routersSelectedChecks = {}
		let countTrue = 0
		_DATA.routers.forEach(r => {
			if(document.getElementById(`check_${r.name}`).checked){
				countTrue++
			}
			routersSelectedChecks[r.name] = document.getElementById(`check_${r.name}`).checked
		})

		console.log("routersSelectedChecks", routersSelectedChecks)
		if(countTrue >= 2){
			$('#step1').hide()
			$('#step2').fadeIn()
		}else{
			alert('לפני ההמשך בחר לפחות 2 נתבים')
		}
	})
	$('#step2 button').click(() => {
		protocolsSelectedChecks = []
		let countTrue = 0
		_DATA.protocols.forEach(r => {
			if(document.getElementById(`check_${r.name}`).checked){
				countTrue++
				protocolsSelectedChecks.push(r.name)
			}
		})

		console.log("protocolsSelectedChecks", protocolsSelectedChecks)
		if(countTrue >= 1){
			$('#step2').hide()
			$('#step3').fadeIn()
		}else{
			alert('בחר לפחות בדיקה אחת')
		}
	})
	$('#step3 button').click(() => {
		let username = $('#username').val()
		let password = $('#password').val()

		loginObj = {
			username,
			password
		}

		console.log("loginObj", loginObj)
		$('#step3').hide()

		$('.logBox').html('')
		$('#step4').fadeIn()
		makeRequest()
	})
})

function makeRequest(){
	console.log("Summery:")

	console.log("routersSelectedChecks", routersSelectedChecks)
	console.log("protocolsSelectedChecks", protocolsSelectedChecks)
	console.log("loginObj", loginObj)

	postData(`${config.server}/newRequest`, {"DATA":{
		loginObj,
		routersSelectedChecks,
		protocolsSelectedChecks
	}}).then(res => {

		console.log("res", res)

		var exampleSocket = new WebSocket("ws://localhost:8081/", "protocolOne");
		
		exampleSocket.onopen = function (event) {
			console.log("On open event")
			exampleSocket.send("start")
			//exampleSocket.send("Here's some text that the server is urgently awaiting!"); 
		};
		exampleSocket.onmessage = function (event) {
			console.log("received: ", event.data);
			if(event.data.includes('END ->>>')){
				exampleSocket.close()
				console.log("Session Closed")
				window.location.href = '/result.html'
			}else{
				$('.logBox').html(event.data.replace(/(?:\r\n|\r|\n)/g, '<br>'))
				document.getElementsByClassName('logBox')[0].scrollTo(0,document.getElementsByClassName('logBox')[0].scrollHeight);
			}
		}
	})

}




