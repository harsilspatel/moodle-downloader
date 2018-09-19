function getFiles() {
	let resourceContainers = Array.from(document.getElementsByClassName("activityinstance")); // realised this is not beautifulSoup 😆
	return resourceContainers
		.filter(resource => (	// filtering out just the files. Noob filtering going on here 😝
			resource.getElementsByClassName("instancename")[0].innerText.slice(-4) == "File"))
		.map(resource => ({
			name: resource.getElementsByClassName("instancename")[0].innerText.slice(0, -4),
			url: resource.getElementsByTagName("a").href + "&redirect=1"}))
		.concat(Array.from(document.getElementsByClassName('cell c1'))
			.filter(resource => resource.getElementsByTagName('img')[0]['alt'] == "File")
			.map(resource => ({
				name: resource.getElementsByTagName('a')[0].innerText,
				url: resource.getElementsByTagName('a')[0].href + "&redirect=1"
			})))
}

function getFolders() {
	var foldersContainers = document.getElementsByClassName("singlebutton");
	for (i = 0; i < foldersContainers.length; i++) {
		var url =
			foldersContainers[i].querySelector("form").action +
			"?id=" +
			foldersContainers[i].querySelectorAll("input")[1].value;
		folders.push(url);
	}
	return folders;
}

getFiles();
// getFolders(); //to-do