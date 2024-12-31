/**
 * moodleDownloader - a chrome extension for batch downloading Moodle resources 💾
 * Copyright (c) 2018 Harsil Patel
 * https://github.com/harsilspatel/MoodleDownloader
 */

const RESOURCES_DOWNLOADER_INTERVAL = 500;
const BACKGROUND_SCRIPT_FILE_PATH = "./src/background.js";
const RESOURCES_SELECTOR_ID = "resources-selector";
const DOWNLOAD_RESOURCES_BUTTON_ID = "download-resources";
const RESOURCES_SEARCH_INPUT_ID = "search";
const FOOTER_ELEMENT_ID = "footer";

let resources = [];

const SetupEventListener = (element, event, callback) => {
    element.addEventListener(event, callback);
}

const PopulateSelector = (resources, selector) => {
    resources.forEach((resource, index) => {
        const option = document.createElement("option");

        option.value = resource.id;
        option.title = resource.name;
        option.innerHTML = resource.name;

        selector.appendChild(option);
    });

    return resources;
}

const Main = () => {
    SetupEventListener(document.getElementById(DOWNLOAD_RESOURCES_BUTTON_ID), "click", DownloadSelectedResources);
    SetupEventListener(document.getElementById(RESOURCES_SEARCH_INPUT_ID), "input", FilterOptions);

    // NOTE: executing background.js to populate the select form
    chrome.tabs.executeScript({ file: BACKGROUND_SCRIPT_FILE_PATH }, result => {
        if (chrome.runtime.lastError)
            console.error(`[error]: from background.js script execution.`, chrome.runtime.lastError.message);
        else
            // NOTE: result is an array of the resources
            resources = PopulateSelector(result[0], document.getElementById(RESOURCES_SELECTOR_ID));
    });
}

const FilterOptions = () => {
    const search = document.getElementById(RESOURCES_SEARCH_INPUT_ID);
    const query = search.value.toLowerCase();
    const regex = new RegExp(query, "i");
    const options = document.getElementById(RESOURCES_SELECTOR_ID).options;

    options.forEach(option => {
        if (option.title.match(regex)) {
            option.removeAttribute("hidden");
        } else {
            option.setAttribute("hidden", "hidden");
        }
    });
}

const UrlResolver = async (initialUrl) => {
    try {
        const response = await fetch(initialUrl, {
            method: 'HEAD',
            redirect: 'follow'
        });

        return response.url;
    } catch (error) {
        console.error(`[url-downloader]: failed to resolve final URL for "${initialUrl}".`);
        return null;
    }
}


const DownloadURLResource = async (unresolvedUrl, index) => {
    const url = await UrlResolver(unresolvedUrl);

    if (!chrome || !chrome.downloads) {
        console.error("chrome.downloads API is not available.");
        return;
    }

    chrome.downloads.download({
        url: url,
        filename: url.split("/").pop()
    }, (downloadId) => {
        if (chrome.runtime.lastError) {
            console.error("Error during download:", chrome.runtime.lastError.message);
        } else {
            console.log(`Download started with ID: ${downloadId}`);
        }
    });
}

const DownloadUnknownResource = (resource, index) => {
    console.log("[unknown-downloader]: downloading resource.");

    setTimeout(() => {
        chrome.downloads.download(resource.downloadOptions);
    }, index * RESOURCES_DOWNLOADER_INTERVAL);
}

const RESOURCES_TYPES_DOWNLOADERS = {
    "URL": DownloadURLResource,
    "UNKNOWN": DownloadUnknownResource
}

const DownloadResource = (resource, index) => {
    const downloads = resource.links.map((link, subIndex) => {
        const downloader = RESOURCES_TYPES_DOWNLOADERS[link.type] || RESOURCES_TYPES_DOWNLOADERS["UNKNOWN"];

        return downloader(link.url, index * (subIndex + 1));
    });

    return downloads;
}

const DownloadSelectedResources = () => {
    const selector = document.getElementById(RESOURCES_SELECTOR_ID);

    const selectedResourcesIds = Array.from(selector.selectedOptions).map(option => option.value);

    console.log(`[resourcesIds]: ${selectedResourcesIds}`);

    selectedResourcesIds.forEach((selectedResourceId, index) => {
        const resource = resources.find(resource => resource.id === parseInt(selectedResourceId));

        console.log(resource)

        DownloadResource(resource, index);
    });
}

// NOTE: run the main function once all the HTML content is loaded
SetupEventListener(document, "DOMContentLoaded", Main);