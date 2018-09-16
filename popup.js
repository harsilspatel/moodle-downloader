function main() {
	let button = document.getElementById("downloadStuff");
	button.addEventListener("click", () => {downloadStuff()})
	chrome.tabs.executeScript({file: "background.js"}, function(result) {
		let files = result[0];
		files.forEach(file => {
			let fileOption = document.createElement("option");
			fileOption.innerHTML = file.name;
			fileOption.value = file.url;
			selectedResources.appendChild(fileOption);
		});
		console.log('populated!')
	});
}

// function getFiles() {
// 	console.log('inside getFiles')
// 	let resourceContainers = Array.from(document.getElementsByClassName("activityinstance")); // realised this is not beautifulSoup 😆
// 	resourceContainers
// 		.filter(resource => (	// filtering out just the files. Noob filtering going on here 😝
// 			resource.getElementsByClassName("instancename")[0].innerText.slice(-4) == "File"))
// 		.map(resource => ({
// 			name: resource.getElementsByClassName("instancename")[0].innerText.slice(0, -4),
// 			url: resource.querySelector("a").href + "&redirect=1"
// 		}));
// }

function downloadStuff() {
	console.log('button pressed!')
	let selectedResources = document.getElementById("selectedResources");
	console.log(Array.from(selectedResources.options).filter(x => x.selected).forEach(x => console.log(x, x.value)));
	console.log(Array.from(selectedResources.options).filter(x => x.selected).forEach(x => chrome.downloads.download({url: x.value})));
}

console.log('😆')
document.addEventListener('DOMContentLoaded', function() {
	main();
});
