function getFiles() {
	console.log('inside getFiles')
	let resourceContainers = Array.from(document.getElementsByClassName("activityinstance")); // realised this is not beautifulSoup 😆
	return resourceContainers
		.filter(resource => (	// filtering out just the files. Noob filtering going on here 😝
			resource.getElementsByClassName("instancename")[0].innerText.slice(-4) == "File"))
		.map(resource => ({
			name: resource.getElementsByClassName("instancename")[0].innerText.slice(0, -4),
			url: resource.querySelector("a").href + "&redirect=1"
		}));
}

function getFolders() {
	console.log('inside getFolders')
	var foldersContainers = document.getElementsByClassName("singlebutton");
	for (i = 0; i < foldersContainers.length; i++) {
		var url =
			foldersContainers[i].querySelector("form").action +
			"?id=" +
			foldersContainers[i].querySelectorAll("input")[1].value;
		folders.push(url);
	}
	//console.log(folders);
	return folders;
}

getFiles();
// getFolders(); //to-do