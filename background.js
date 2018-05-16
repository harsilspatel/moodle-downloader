chrome.browserAction.onClicked.addListener(function(tab){chrome.tabs.executeScript({file: "download.js"}, function(result){
	console.log(result);
	
	for (i = 0; i < result[0][0].length; i++) {
		const resource = result[0][0][i]
		chrome.downloads.download({url: resource[0], filename: resource[1]})
	}
	
	for (i = 0; i < result[0][1].length; i++) {
		console.log("opening ", result[0][1][i]);
		chrome.tabs.create({ url: result[0][1][i] });
	}
	})});

//chrome.browserAction.onClicked.addListener(function(tab){chrome.tabs.executeScript({file: "download.js"}, function(result){
//	console.log(result[0]);
//	console.log(result[1]);
//	})});