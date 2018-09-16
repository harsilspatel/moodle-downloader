function getFiles() {
	console.log('inside getFiles')
	let resourceContainers = Array.from(document.getElementsByClassName("activityinstance")); // realised this is not beautifulSoup 😆
	return resourceContainers
		.filter(resource => (	// filtering out just the files. Noob filtering going on here 😝
			resource.getElementsByClassName("instancename")[0].innerText.slice(-4) == "File"))
		.map(resource => ({
			name: resource.getElementsByClassName("instancename")[0].innerText.slice(0, -4),
			url: resource.querySelector("a").href + "&redirect=1"
		}));
}

getFiles();