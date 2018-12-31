/**
 * moodleDownloader - a chrome extension for batch downloading Moodle resources 💾
 * Copyright (c) 2018 Harsil Patel
 * https://github.com/harsilspatel/MoodleDownloader
 */

// The session key should normally be accessible through window.M.cfg.sesskey,
// but getting the window object is hard.
// Instead, we can grab the session key from the logout button:
const sesskey = (
	new URL(document.querySelector("a[href*='login/logout.php']").href)
).searchParams.get("sesskey");

function getDownloadOptions(url) {
	if (!url.includes("folder")) {
		// Resources and other unsupported types.
		return {
			url: url + "&redirect=1"
		};
	}
	const urlObj = new URL(url);
	const id = urlObj.searchParams.get("id");
	// We will modify the downloadURL such that each folder has a
	// unique download URL (so suggestFilename will work).
	// Adding "?id=ID" to the POST URL still results in a valid
	// request, so we can use this to uniquely identify downloads.
	const downloadUrl =
		urlObj.origin +
		urlObj.pathname.slice(undefined, urlObj.pathname.lastIndexOf("/")) +
		"/download_folder.php?id=" + id;
	return {
		url: downloadUrl,
		method: "POST",
		headers: [
			{
				name: "content-type",
				value: "application/x-www-form-urlencoded"
			}
		],
		body: `id=${id}&sesskey=${sesskey}`
	};
}

function getActivityName(activity) {
	return activity.getElementsByClassName("instancename")[0].firstChild.textContent.trim();
}

function getFilesUnderSection() {
	return Array.from(document.getElementsByClassName('content'))
		.map(content => {
			const sectionEl = content.querySelector("h3.sectionname");
			if (!sectionEl)
				return [];
			const section = sectionEl.textContent.trim();
			return Array.from(content.querySelectorAll("activity resource, activity folder"))
				.map(activity => ({
					name: getActivityName(activity),
					downloadOptions: getDownloadOptions(activity.getElementsByTagName("a")[0].href),
					section: section}));
		}).reduce((x, y) => x.concat(y), []);
}

function getFilesUnderResources() {
	return Array.from(document.getElementsByTagName('tr')) // to get files under Resources tab
			.filter(resource => resource.getElementsByTagName('img').length != 0)
			.map(resource => (resource = {
				name: resource.getElementsByTagName('a')[0].textContent.trim(),
				downloadOptions: getDownloadOptions(resource.getElementsByTagName('a')[0].href),
				type: resource.getElementsByTagName('img')[0]['alt'],
				section: resource.getElementsByTagName('td')[0].textContent.trim()}))
			.map((resource, index, array) => {
				resource.section = (resource.section ? resource.section : array[index-1].section);
				return resource})
			.filter(resource => resource.type === 'File' || resource.type === 'Folder')
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
