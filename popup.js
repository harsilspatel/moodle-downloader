function main() {
	console.log('it works 😆');
	let selectedResources = document.getElementById("selectedResources");
	let x = document.createElement("option")
	x.innerHTML = "x"
	x.value = "https:github.com/harsilspatel"
	selectedResources.appendChild(x);


	// let files = getFiles();
}

function getFiles() {
	let files = []
	let resourceContainers = Array.from(document.getElementsByClassName("activityinstance")); // realised this is not beautifulSoup 😆
	return resourceContainers
		.filter(resource => (	// filtering out just the files. Noob filtering going on here 😝
			resource.getElementsByClassName("instancename")[0].innerText.slice(-4) == "File"))
		.map(resource => ({
			fileName: resource.getElementsByClassName("instancename")[0].innerText.slice(0, -4),
			fileUrl: resource.querySelector("a").href + "&redirect=1"
		}));
}

function downloadStuff() {
	let selectedResources = document.getElementById("selectedResources");
	console.log(Array.from(selectedResources.options).filter(x => x.selected).forEach(x => console.log(x, x.value)));
}