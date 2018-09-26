function main() {
	

	let button = document.getElementById("downloadStuff");
	button.addEventListener("click", () => downloadStuff());

	// executing background.js to populate the select form
	chrome.tabs.executeScript({file: "background.js"}, function(result) {
		try {
			let selectedResources = document.getElementById("selectedResources");
			let files = result[0];
			files.forEach(file => {
				let fileOption = document.createElement("option");
				// creating option element such that the text will be
				// the resource name and the option value its url.
				fileOption.innerHTML = file.name;
				fileOption.value = file.url;
				selectedResources.appendChild(fileOption);
				console.log('populated!');
			});
		} catch(error) {
			console.log(error)
		}
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

document.addEventListener('DOMContentLoaded', function() {
	main();
});
