function ValidateIPaddress(ipaddress) {  
	if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
	  return (true)  
	}  
	return (false)  
  }  

$(document).ready(function(){
	
	
	var selectionType = 'segment'
	var scanAdd;
	var showOnlyOutput = true;
	var username = '';
	var password = '';

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
		let addrs = $('#addressGroupTextare').val()
		showOnlyOutput = document.getElementById('upgradeOption').checked
		let addrsArr = addrs.split('\n')
		addrsArr = addrsArr.map(add => {
			return add.trim(' ')
		})
		
		if(addrsArr.every(add => ValidateIPaddress(add))){
			console.log("addrsArr", addrsArr)
			scanAdd = addrsArr
			$('.setGroupSection').hide()
			$('#backStep').data('step', 'group')
			$('.setGUserSection').fadeIn()
			selectionType = 'group'
		}else{
			alert('וודא שהכתובות חוקיות')
		}
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
	$('#finishGUserBtn').click(() => {
		username = $('#g_user').val()
		password = $('#g_pass').val()
		var d = {
			selectionType,
			scanAdd,
			showOnlyOutput,
			username,
			password
		}
		
		postData(`${config.server}/newRecord`, {'data': d}).then(result => {
			console.log(result)
			if(result.status == 'OK'){
				window.location.href = '/records.html?recordId=' + result.recordId
			}
		})
	})

})




