const resourceContainer = document.getElementsByClassName("activityinstance");
var resources = [];

for (i = 0; i < resourceContainer.length; i++) {
	var name = resourceContainer[i].getElementsByClassName("instancename")[0].innerText;
	if (name.slice(-4) != "File") {
		continue
	}
	name = name.replace(/:/g , " -");
	const fullname = name.slice(0,-5) + ".pdf"
	const url = resourceContainer[i].querySelector("a").href;
	resources.push([url, fullname]);
}

resources;