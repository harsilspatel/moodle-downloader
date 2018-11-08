/**
 * moodleDownloader - a chrome extension for batch downloading Moodle resources 💾
 * Copyright (c) 2018 Harsil Patel
 * https://github.com/harsilspatel/MoodleDownloader
 */

function getFilesUnderSection() {
	return Array.from(document.getElementsByClassName('content'))
		.map(content =>
			Array.from(content.getElementsByClassName("activityinstance"))
				.filter(resource => (	// filtering out just the files. Noob filtering going on here 😝
					resource.getElementsByClassName("instancename")[0].innerText.slice(-4) == "File"))
				.map(resource => ({
					name: resource.getElementsByClassName("instancename")[0].innerText.slice(0, -4).trim().toLowerCase(),
					url: resource.getElementsByTagName("a")[0].href + "&redirect=1",
					section: content.getElementsByTagName("h3")[0].innerText.trim()})))
		.reduce((x, y) => x.concat(y), []);
}

function getFilesUnderResources() {
	return Array.from(document.getElementsByTagName('tr')) // to get files under Resources tab
			.filter(resource => resource.getElementsByTagName('img').length != 0)
			// .filter(resource => resource.getElementsByTagName('img')[0]['alt'] == "File")
			.map(resource => (resource = {
				name: resource.getElementsByTagName('a')[0].innerText.trim().toLowerCase(),
				url: resource.getElementsByTagName('a')[0].href + "&redirect=1",
				type: resource.getElementsByTagName('img')[0]['alt'],
				section: resource.getElementsByTagName('td')[0].innerText.trim()}))
			.map((resource, index, array) => {
				resource.section = (resource.section ? resource.section : array[index-1].section);
				return resource})
			.filter(resource => resource.type == 'File')
}

function getFiles() {
	let courseName = document.getElementsByTagName('h1')[0].innerText;
	let filesUnderSection = getFilesUnderSection()
	let filesUnderResources = getFilesUnderResources();
	let allFiles = filesUnderSection.concat(filesUnderResources);
	// console.log(filesUnderSection);
	// console.log(filesUnderResources);
	// console.log(allFiles);
	allFiles.forEach(file => file.course = courseName)
	return allFiles;
}

getFiles();