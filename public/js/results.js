
let timer;

$(document).ready(function(){
	postData(`${config.server}/getLastResult`, {}).then(res => {
		console.log(res)
		if(res.status == "err"){
			window.location.href = "/"
		}else{
			let d = new Date()
			let time_update = d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2) + " " + d.getDate() + "/" + (parseInt(d.getMonth())+1) + "/" + d.getFullYear()
			$('.last_update_span').html("עדכון אחרון: " + time_update)
			//TODO: renderResults(results)
	
			//setTimeout(makeRequest, 1000 * 5)
		}
	})
})

$('.logsBtn').click(() => {
	$('.backdrop').fadeIn()
	$('#logTextArea').fadeIn()
})
$('.backdrop').click(() => {
	$('.backdrop').fadeOut()
	$('#logTextArea').fadeOut()
})

var exampleSocket;
function makeRequest(){
		console.log("Summery:")

		postData(`${config.server}/re-Request`, {}).then(res => {

			console.log("res", res)
			if(res.status == "err"){
				window.location.href = '/'
				return;
			}

			exampleSocket = new WebSocket("ws://localhost:8081/", "protocolOne");
			
			exampleSocket.onopen = function (event) {
				exampleSocket.send("start")
				console.log("On open event")
			};
			exampleSocket.onmessage = function (event) {
				console.log("received: ", event.data);
				if(event.data.includes('END ->>>')){
					exampleSocket.close()
					let d = new Date()
					let time_update = d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2) + " " + d.getDate() + "/" + (parseInt(d.getMonth())+1) + "/" + d.getFullYear()
					$('.last_update_span').html("עדכון אחרון: " + time_update)
					exampleSocket = ''
					//openedConnection = false
					console.log("Session Closed")
					console.log("Rendering results again..")
					setTimeout(makeRequest, 1000 * 5)
					//TODO: renderResults(results)

				}else{
					//console.log(event.data)
					$('#logTextArea').html(event.data.replace(/(?:\r\n|\r|\n)/g, '<br>'))
					document.getElementById('logTextArea').scrollTo(0,document.getElementById('logTextArea').scrollHeight);
				}
			}
		})

}

