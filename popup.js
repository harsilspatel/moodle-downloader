function main() {

	// google analytics 
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-119398707-1']);
	_gaq.push(['_trackPageview']);

	(function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = 'https://ssl.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();

	// downloadStuff on button press
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

function downloadStuff() {
	console.log('button pressed!')
	
	let selectedResources = document.getElementById("selectedResources");
	Array.from(selectedResources.options).filter(x => x.selected).forEach(x => console.log(x, x.value));
	Array.from(selectedResources.options).filter(x => x.selected).forEach(x => chrome.downloads.download({url: x.value}));
	_gaq.push(['_trackEvent', 'downloadStuff', 'clicked']);
}

document.addEventListener('DOMContentLoaded', function() {
	main();
});
