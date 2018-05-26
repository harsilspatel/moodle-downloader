var resourceContainer = document.getElementsByClassName("activityinstance");
var resources = [];

for (i = 0; i < resourceContainer.length; i++) {
	try {
		var name = resourceContainer[i].getElementsByClassName("instancename")[0].innerText;
		if (name.slice(-4) == "File") {
			var url = resourceContainer[i].querySelector("a").href + "&redirect=1";
			resources.push([url]);
		}	
	} catch (error) {
		console.log(i, error)
	}
}
//console.log(resources);


var foldersContainers = document.getElementsByClassName("singlebutton");
var folders = [];
for (i = 0; i < foldersContainers.length; i++) {
	var url = foldersContainers[i].querySelector("form").action + "?id=" + foldersContainers[i].querySelectorAll("input")[1].value

	folders.push(url)
}
//console.log(folders);

result = [resources, folders];
//console.log(result);
result;