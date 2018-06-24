function getFiles(resourceContainers) {
	var files = [];
	for (i = 0; i < resourceContainers.length; i++) {
		try {
			var name = resourceContainers[i].getElementsByClassName(
				"instancename"
			)[0].innerText;
			if (name.slice(-4) == "File") {
				var url =
					resourceContainers[i].querySelector("a").href +
					"&redirect=1";
				files.push([url]);
			}
		} catch (error) {
			console.log(i, error);
		}
	}
	//console.log(resources);
	return files;
}

function getFolders() {
	var foldersContainers = document.getElementsByClassName("singlebutton");
	var folders = [];
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
//console.log(result);
var resourceContainers = document.getElementsByClassName("activityinstance");
result = [getFiles(resourceContainers), getFolders()];
result;