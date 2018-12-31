/**
 * moodleDownloader - a chrome extension for batch downloading Moodle resources 💾
 * Copyright (c) 2018 Harsil Patel
 * https://github.com/harsilspatel/MoodleDownloader
 */

function getActivityName(activity) {
	return activity.getElementsByClassName("instancename")[0].firstChild.textContent.trim();
}

function getFilesUnderSection() {
	// The session key should normally be accessible through window.M.cfg.sesskey,
	// but getting the window object is hard.
	// Instead, we can grab the session key from the logout button:
	const logoutButton = document.querySelector("a[href*='login/logout.php']");
	const sesskey = (new URL(logoutButton.href)).searchParams.get("sesskey");
	return Array.from(document.getElementsByClassName('content'))
		.map(content => {
			const sectionEl = content.querySelector("h3.sectionname");
			if (!sectionEl)
				return [];
			const section = sectionEl.textContent.trim();
			const resources = Array.from(content.getElementsByClassName("activity resource modtype_resource "))
				.map(resource => ({
					name: getActivityName(resource),
					downloadOptions: {
						url: resource.getElementsByTagName("a")[0].href + "&redirect=1"
					},
					section: section}));
			const folders = Array.from(content.getElementsByClassName("activity folder modtype_folder "))
				.map(folder => {
					const url = new URL(folder.getElementsByTagName("a")[0].href);
					const id = url.searchParams.get("id");
					// We will modify the downloadURL such that each folder has a
					// unique download URL (so suggestFilename will work).
					// Adding "?id=ID" to the POST URL still results in a valid
					// request, so we can use this to uniquely identify downloads.
					const downloadUrl =
						url.origin +
						url.pathname.slice(undefined, url.pathname.lastIndexOf("/")) +
						"/download_folder.php?id=" + id;
					return {
						name: getActivityName(folder),
						downloadOptions: {
							url: downloadUrl,
							method: "POST",
							headers: [
								{
									name: "content-type",
									value: "application/x-www-form-urlencoded"
								}
							],
							body: `id=${id}&sesskey=${sesskey}`
						},
						section: section
					};
				});
			return resources.concat(folders);
		}).reduce((x, y) => x.concat(y), []);
}

function getFilesUnderResources() {
	return Array.from(document.getElementsByTagName('tr')) // to get files under Resources tab
			.filter(resource => resource.getElementsByTagName('img').length != 0)
			.map(resource => (resource = {
				name: resource.getElementsByTagName('a')[0].textContent.trim(),
				downloadOptions: {
					url: resource.getElementsByTagName('a')[0].href + "&redirect=1"
				},
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
