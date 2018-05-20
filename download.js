var resourceContainer = document.getElementsByClassName("activityinstance");
var resources = [];

for (i = 0; i < resourceContainer.length; i++) {
	var name = resourceContainer[i].getElementsByClassName("instancename")[0].innerText;
	if (name.slice(-4) != "File") {
		continue
	}
	name = name.slice(0,-5).replace(/:/g , " -");
	if (resourceContainer[i].querySelector("img").src.slice(-7,-3) == "text") {
		fullname = name + ".txt"
	} else {
		fullname = name + ".pdf";
	}
	var url = resourceContainer[i].querySelector("a").href + "&redirect=1";
	resources.push([url, fullname]);
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