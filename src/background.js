/**
 * moodleDownloader - a chrome extension for batch downloading Moodle resources 💾
 * Copyright (c) 2018 Harsil Patel
 * https://github.com/harsilspatel/MoodleDownloader
 */

// TODO: instead of depending on the user's location, we should detect and scrape the course id of the user and automatically go to the resources page: https://moodle.univ-lille.fr/course/resources.php?id={course_id}
// NOTE: this page contains all the resources of the moodle course in a single page, so we can easily scrape all the resources from here.

// TODO: check if this resources page is available on all moodle version, if it can be disabled or not, etc. To include as much debug options and indications as possible for the end users.

// TODO: use typescript for better type checking and to avoid bugs

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

const ExtractLinksFromText = (textHtml) => {
	const parser = new DOMParser();

	const doc = parser.parseFromString(textHtml, 'text/html');

	const anchorTags = doc.querySelectorAll('a');

	const links = Array.from(anchorTags)
		.map(anchor => anchor.getAttribute('href'))
		// NOTE: to exclude all null or empty href tags
		.filter(link => link !== null && link !== '');

	return links.length > 0 ? links : [];
};

const HtmlTableDataParser = (table) => {
	const data = [];

	const rows = table.rows;

	for (let i = 0; i < rows.length; i++) {
		const cells = rows[i].cells;
		const rowData = [];

		for (let j = 0; j < cells.length; j++) {
			rowData.push({
				name: cells[j].innerText,
				links: ExtractLinksFromText(String(cells[j].innerHTML))
			});
		}

		data.push(rowData);
	}

	return data;
}

const main = () => {
	const table = document.getElementsByClassName("generaltable mod_index")[0];

	const data = HtmlTableDataParser(table);

	// TODO: transform the data and extract sort of object for each resource, the object should contain the resource name, url and type (type will be empty at first)

	// TODO: complete the previously extracted data by visiting each url and getting the type of the resource (pdf, php, etc)

	// TODO: pass the appropriate data / types to a downloader that'll automatically download the data depending on whether it is url, direct file, etc

	return 0
}