const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const recordId = urlParams.get('recordId')
console.log(recordId);

var input = {
    year: 0,
    month: 0,
    day: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
};

var timestamp = new Date(input.year, input.month, input.day,
input.hours, input.minutes, input.seconds);

var interval = 1;
let timer;

getData(`${config.server}/records/${recordId}`).then(result => {
	if(result.status == 'OK'){
		console.log("recordState", result.recordState)

		let exampleSocket = new WebSocket("ws://localhost:3998/", "protocolOne");
			
		exampleSocket.onopen = function (event) {
			exampleSocket.send("getState---"+recordId)
			console.log("On open event")
			timer = setInterval(function () {
				timestamp = new Date(timestamp.getTime() + interval * 1000);
				document.getElementById('time').innerHTML = ("0" + timestamp.getMinutes()).slice(-2) + ':' + ("0" + timestamp.getSeconds()).slice(-2)
			}, Math.abs(interval) * 1000);
		};
		exampleSocket.onmessage = function (event) {
			console.log("received: ", event.data);
			let msg = event.data

			if(msg.includes('recordState')){
				let recordState = msg.split('---')[1]
				if(recordState == 'running'){
					$('.running').show()
					$('.broken').hide()
					setTimeout(() => {
						exampleSocket.send("getState---"+recordId)
					}, 1000)
				}else{
					console.log("finished recordState:", recordState)
					console.log("Closing Socket")
					exampleSocket.close()
					clearInterval(timer)

					if(recordState == 'finished'){
						$('.running').hide()
						$('.broken').hide()
						$('.finished').show()

						getData(`${config.server}/getRecordOutput/${recordId}`).then(res => {
							console.log(res)
							
							//todo renderTable()
						})

					}else{
						$('.running').hide()
						$('.broken').show()
					}
				}
			}else{
				console.log("err 1")
			}
			
		}
	}else{
		$('.running').hide()
		$('.broken').show()
	}
}).catch((err) => {
	$('.running').hide()
	$('.broken').show()
})

$('#upgradeSelectedBtn').click(() => {
	var values = [];
	$('#results_table input[type="checkbox"]:checked').each(function(i,v){
		values.push($(v).val());
	});	
	if(values.length > 0){
		console.log("values", values)
		var d = {
			selectionType:'group',
			'scanAdd':values,
			'showOnlyOutput':false
		}
	
		postData(`${config.server}/newRecord_external`, {'data': d}).then(result => {
			console.log(result)
			if(result.status == 'OK'){
				window.open('/records.html?recordId=' + result.recordId)
			}
		})
	}
})