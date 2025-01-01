export const GetActiveTabUrl = () => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const currentTab = tabs[0];
                const currentURL = currentTab.url;

                resolve(currentURL);
            } else {
                reject("No active tab found.");
            }
        });
    });
}

export const NavigateTo = (url) => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { url });

                resolve(true)
            } else {
                reject("No active tab found.");
            }
        });
    });
}