/**
 * moodleDownloader - a chrome extension for batch downloading Moodle resources 💾
 * Copyright (c) 2018 Harsil Patel
 * https://github.com/harsilspatel/MoodleDownloader
 */

function getFiles() {
	let resourceContainers = Array.from(document.getElementsByClassName("activityinstance")); // realised this is not beautifulSoup 😆
	return resourceContainers
		.filter(resource => (	// filtering out just the files. Noob filtering going on here 😝
			resource.getElementsByClassName("instancename")[0].innerText.slice(-4) == "File"))
		.map(resource => ({
			name: resource.getElementsByClassName("instancename")[0].innerText.slice(0, -4),
			url: resource.getElementsByTagName("a")[0].href + "&redirect=1"}))
		.concat(Array.from(document.getElementsByClassName('cell c1')) // to get files under Resources tab
			.filter(resource => resource.getElementsByTagName('img')[0]['alt'] == "File")
			.map(resource => ({
				name: resource.getElementsByTagName('a')[0].innerText,
				url: resource.getElementsByTagName('a')[0].href + "&redirect=1"
			})))
}

getFiles();