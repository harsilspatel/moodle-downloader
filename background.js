chrome.browserAction.onClicked.addListener(function(tab){chrome.tabs.executeScript({file: "download.js"}, function(result){
	for (i = 0; i < result[0].length; i++) {
		const resource = result[0][i]
		chrome.downloads.download({url: resource[0], filename: resource[1]})
	}
	})});

//chrome.browserAction.onClicked.addListener(function(tab){chrome.tabs.executeScript({file: "download.js"}, function(result){
//	console.log(result)
//	})});