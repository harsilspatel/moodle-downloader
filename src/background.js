/**
 * moodleDownloader - a chrome extension for batch downloading Moodle resources 💾
 * Copyright (c) 2018 Harsil Patel
 * https://github.com/harsilspatel/MoodleDownloader
 */

function getDownloadOptions(sesskey, url) {
	if (!url.includes("folder")) {
		// Resources, URLs, Pages.
		// URLs and Pages need to be handled in popup.js.
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
		"/download_folder.php?id=" +
		id;
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

var SUPPORTED_FILES = new Set(["File", "Folder", "URL", "Page"]);

function getFilesUnderSection(sesskey) {
	return Array.from(document.getElementsByClassName("content"))
		.map(content => {
			const sectionEl = content.querySelector("h3.sectionname");
			if (!sectionEl) return [];
			const section = sectionEl.textContent.trim();
			return Array.from(content.getElementsByClassName("activity"))
				.map(activity => ({
					instanceName: activity.getElementsByClassName(
						"instancename"
					)[0],
					archorTag: activity.getElementsByTagName("a")[0]
				}))
				.filter(
					({ instanceName, archorTag }) =>
						instanceName !== undefined && archorTag !== undefined
				)
				.map(({ instanceName, archorTag }) => ({
					name: instanceName.firstChild.textContent.trim(),
					downloadOptions: getDownloadOptions(
						sesskey,
						archorTag.href
					),
					type: instanceName.lastChild.textContent.trim(),
					section: section
				}))
				.filter(activity => SUPPORTED_FILES.has(activity.type));
		})
		.reduce((x, y) => x.concat(y), []);
}

function getFilesUnderResources(sesskey, tableBody) {
	return Array.from(tableBody.children) // to get files under Resources tab
		.filter(resource => resource.getElementsByTagName("img").length != 0)
		.map(
			resource =>
				(resource = {
					name: resource
						.getElementsByTagName("a")[0]
						.textContent.trim(),
					downloadOptions: getDownloadOptions(
						sesskey,
						resource.getElementsByTagName("a")[0].href
					),
					type: resource.getElementsByTagName("img")[0]["alt"].trim(),
					section: resource
						.getElementsByTagName("td")[0]
						.textContent.trim()
				})
		)
		.map((resource, index, array) => {
			resource.section =
				resource.section ||
				(array[index - 1] && array[index - 1].section) ||
				"";
			return resource;
		})
		.filter(resource => SUPPORTED_FILES.has(resource.type));
}

function getFiles() {
	const h1s = document.getElementsByTagName("h1");
	const headerTitles = document.getElementsByClassName("header-title");
	const breadcrumbItems = document.getElementsByClassName("breadcrumb-item");
	const pageHeader = document.querySelector("header#page-header .header-title")
	const courseName = (
			h1s.length && h1s[0].innerText ||
			headerTitles.length && headerTitles[0].innerText ||
			pageHeader.textContent ||
			breadcrumbItems.length > 2 && breadcrumbItems[2].firstElementChild.title ||
			""
		).trim();

	// The session key should normally be accessible through window.M.cfg.sesskey,
	// but getting the window object is hard.
	// Instead, we can grab the session key from the logout button.
	// Note that var is used here as this script can be executed multiple times.
	const sesskey = new URL(
		document.querySelector("a[href*='login/logout.php']").href
	).searchParams.get("sesskey");

	const tableBody = document.querySelector(
		"div[role='main'] > table.generaltable.mod_index > tbody"
	);
	const allFiles =
		tableBody === null
			? getFilesUnderSection(sesskey)
			: getFilesUnderResources(sesskey, tableBody);
	allFiles.forEach(file => (file.course = courseName));
	console.log(allFiles);
	return allFiles;
}

getFiles();
