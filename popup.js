function main() {
	console.log('it works 😆');
	getFiles();
}

function getFiles() {
	let resourceContainers = document.getElementsByClassName("activityinstance");
	resourceContainers
		.filter(resource => (	// filtering out just the files. Noob filtering going on here 😝
			resource.getElementsByClassName("instancename")[0].innerText.slice(-4) == "File"))
		.forEach(resource => console.log(resource));
}