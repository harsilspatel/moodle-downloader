/**
 * moodleDownloader - a chrome extension for batch downloading Moodle resources 💾
 * Copyright (c) 2018 Harsil Patel
 * https://github.com/harsilspatel/MoodleDownloader
 */

function getFilesUnderSection() {
	return Array.from(document.getElementsByClassName('content'))
		.map(content =>
			Array.from(content.getElementsByClassName("activity resource modtype_resource "))
				.map(resource => ({
					name: resource.getElementsByClassName("instancename")[0].firstChild.textContent.trim(),
					url: resource.getElementsByTagName("a")[0].href + "&redirect=1",
					section: content.getElementsByTagName("h3")[0].textContent.trim()})))
		.reduce((x, y) => x.concat(y), []);
}

function getFilesUnderResources() {
	return Array.from(document.getElementsByTagName('tr')) // to get files under Resources tab
			.filter(resource => resource.getElementsByTagName('img').length != 0)
			.map(resource => (resource = {
				name: resource.getElementsByTagName('a')[0].textContent.trim(),
				url: resource.getElementsByTagName('a')[0].href + "&redirect=1",
				type: resource.getElementsByTagName('img')[0]['alt'],
				section: resource.getElementsByTagName('td')[0].textContent.trim()}))
			.map((resource, index, array) => {
				resource.section = (resource.section ? resource.section : array[index-1].section);
				return resource})
			.filter(resource => resource.type == 'File')
}

function getFiles() {
	let courseName;
	try {
		courseName = document.getElementsByTagName('h1')[0].textContent;
	} catch {
		courseName = document.getElementsByClassName('breadcrumb-item')[2].firstElementChild.title;
	}

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
