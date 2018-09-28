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

	// filter resources on input
	let searchField = document.getElementById("search");
	searchField.addEventListener("input", () => filterList());

	// executing background.js to populate the select form
	chrome.tabs.executeScript({file: "background.js"}, function(result) {
		try {
			let resourceSelector = document.getElementById("resourceSelector");
			let files = result[0];
			files.forEach(file => {
				let fileOption = document.createElement("option");

				// creating option element such that the text will be
				// the resource name and the option value its url.
				fileOption.innerHTML = file.name;
				fileOption.value = file.url;
				resourceSelector.appendChild(fileOption);
				console.log('populated!');
			});
		} catch(error) {
			console.log(error);
		}
	});
}

function filterList() {
	let searchField = document.getElementById("search");
	let query = searchField.value.toLowerCase();

	let resourceSelector = document.getElementById("resourceSelector");
	Array.from(resourceSelector.options).forEach(option => {
		option.innerHTML.toLowerCase().includes(query) ?
		option.removeAttribute('hidden') :
		option.setAttribute('hidden', 'hidden');
	});

}

function downloadStuff() {
	let resourceSelector = document.getElementById("resourceSelector");
	Array.from(resourceSelector.options).filter(option => option.selected).forEach(option => chrome.downloads.download({url: option.value}));
	_gaq.push(['_trackEvent', 'downloadStuff', 'clicked']);
}

document.addEventListener('DOMContentLoaded', function() {
	main();
});
