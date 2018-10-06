function main() {

	// google analytics

	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

		ga('create', 'UA-119398707-1', 'auto');
		ga('set', 'checkProtocolTask', null);
		ga('send', 'pageview', '/popup.html');

	// array of titles of resources in lower case
	let resourceTitle = []

	// downloadResources on button press
	let button = document.getElementById("downloadResources");
	button.addEventListener("click", () => downloadResources());

	// filter resources on input
	let searchField = document.getElementById("search");
	searchField.addEventListener("input", () => filterOptions(resourceTitle));

	// executing background.js to populate the select form
	chrome.tabs.executeScript({file: "background.js"}, function(result) {
		try {
			let resourceSelector = document.getElementById("resourceSelector");
			let resources = result[0];
			resources.forEach(resource => {
				let resourceOption = document.createElement("option");

				// saving titles in lower case
				resourceTitle.push(resource.name.toLowerCase())

				// creating option element such that the text will be
				// the resource name and the option value its url.
				resourceOption.value = resource.url;
				resourceOption.title = resource.name;
				resourceOption.innerHTML = resource.name;
				resourceSelector.appendChild(resourceOption);
			});
		} catch(error) {
			console.log(error);
		}
	});
}

function filterOptions(resourceTitle) {
	let searchField = document.getElementById("search");
	let query = searchField.value.toLowerCase();
	let options = document.getElementById("resourceSelector").options;

	resourceTitle.forEach(function(title, index) {
		title.includes(query) ?
		options[index].removeAttribute('hidden') :
		options[index].setAttribute('hidden', 'hidden');
	})

	// Array.from(resourceSelector.options).forEach(option => {
	// 	option.innerHTML.toLowerCase().includes(query) ?
	// 	option.removeAttribute('hidden') :
	// 	option.setAttribute('hidden', 'hidden');
	// });
}

function downloadResources() {
	let resourceSelector = document.getElementById("resourceSelector");
	let selectedOptions = Array.from(resourceSelector.options).filter(option => option.selected)
	ga('send', 'event', {
		'eventCategory': 'click',
		'eventAction': 'downloadResources',
		'eventValue': selectedOptions.length
	  });
	selectedOptions.forEach(option => chrome.downloads.download({url: option.value}));
}

document.addEventListener('DOMContentLoaded', function() {
	main();
});
