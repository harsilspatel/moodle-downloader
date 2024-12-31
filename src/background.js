/**
 * moodleDownloader - a chrome extension for batch downloading Moodle resources 💾
 * Copyright (c) 2018 Harsil Patel
 * https://github.com/harsilspatel/MoodleDownloader
 */

// TODO: instead of depending on the user's location, we should detect and scrape the course id of the user and automatically go to the resources page: https://moodle.univ-lille.fr/course/resources.php?id={course_id}
// NOTE: this page contains all the resources of the moodle course in a single page, so we can easily scrape all the resources from here.

// TODO: check if this resources page is available on all moodle version, if it can be disabled or not, etc. To include as much debug options and indications as possible for the end users.

// TODO: use typescript for better type checking and to avoid bugs

function ExtractLinksFromText(textHtml) {
	const parser = new DOMParser();

	const doc = parser.parseFromString(textHtml, 'text/html');

	const anchorTags = doc.querySelectorAll('a');

	const links = Array.from(anchorTags)
		.map(anchor => anchor.getAttribute('href'))
		// NOTE: to exclude all null or empty href tags
		.filter(link => link !== null && link !== '');

	return links.length > 0 ? links : [];
};

function HtmlTableDataParser(table) {
	const rawData = [];

	const rows = table.rows;

	for (let i = 1; i < rows.length; i++) {
		const cells = rows[i].cells;
		const rowData = [];

		for (let j = 0; j < cells.length; j++) {
			rowData.push({
				name: cells[j].innerText,
				links: ExtractLinksFromText(String(cells[j].innerHTML))
			});
		}

		// NOTE: if the row data is not complete, we should skip it
		if (rowData.length != 3)
			continue;

		// NOTE: if the section name is empty, we should use the previous section name
		if (rowData[0].name === '')
			rowData[0].name = rawData[rawData.length - 1][0].name;

		rawData.push(rowData);
	}

	return rawData;
}

function ReShapeHtmlTableRawData(rawData) {
	const reshapedData = [];

	rawData.forEach(([section, resource, description], index) => {
		reshapedData.push({
			id: index,
			section: section.name,
			name: resource.name,
			description: description.name,
			links: [
				// TODO: the links should be an array of objects where each object has a link and a type of the link (pdf, php, etc) and a source: "resource" or "description"
				// TODO: if the link don't directly point to a pdf like resource, we should visit the link and get the type of the resource and replace the link with the direct link to the resource
				...resource.links.map(link => ({ link, type: "UNKNOWN", source: "resource" })),
				...description.links.map(link => ({ link, type: "UNKNOWN", source: "description" }))
			]
		});
	});

	return reshapedData;
}

function LoadResources() {
	let rawData = HtmlTableDataParser(document.getElementsByClassName("generaltable mod_index")[0]);

	let reshapedData = ReShapeHtmlTableRawData(rawData);

	console.log(reshapedData);

	return reshapedData;
}

LoadResources();