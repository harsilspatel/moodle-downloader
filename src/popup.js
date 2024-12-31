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
}

const Main = () => {
    SetupEventListener(document.getElementById(DOWNLOAD_RESOURCES_BUTTON_ID), "click", DownloadSelectedResources);
    SetupEventListener(document.getElementById(RESOURCES_SEARCH_INPUT_ID), "input", FilterOptions);

    // NOTE: executing background.js to populate the select form
    chrome.tabs.executeScript({ file: BACKGROUND_SCRIPT_FILE_PATH }, result => {
        resources = PopulateSelector(result, document.getElementById(RESOURCES_SELECTOR_ID));
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

const DownloadURLResource = (resource, index) => {
    // We need to get the URL of the redirect and create a blob for it.
    fetch(resource.downloadOptions.url, { method: "HEAD" }).then(
        req => {
            const blob = new Blob(
                [`[InternetShortcut]\nURL=${req.url}\n`],
                { type: "text/plain" }
            );
            const blobUrl = URL.createObjectURL(blob);
            const newOptions = {
                url: blobUrl
            };
            resource.downloadOptions = newOptions;
            setTimeout(() => {
                chrome.downloads.download(newOptions);
            }, index * RESOURCES_DOWNLOADER_INTERVAL);
        });
}

const DownloadPageResource = (resource, index) => {
    fetch(resource.downloadOptions.url)
        .then(req => {
            return req.text();
        })
        .then(text => {
            // We want to grab "[role='main']" from the text and save that
            // as an HTML file.
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");
            const toSave = doc.querySelector("[role='main']").outerHTML;
            const blob = new Blob([toSave], { type: "text/html" });
            const blobUrl = URL.createObjectURL(blob);
            const newOptions = {
                url: blobUrl
            };
            resource.downloadOptions = newOptions;
            setTimeout(() => {
                chrome.downloads.download(newOptions);
            }, index * RESOURCES_DOWNLOADER_INTERVAL);
        });
}

const DownloadUnknownResource = (resource, index) => {
    setTimeout(() => {
        chrome.downloads.download(resource.downloadOptions);
    }, index * RESOURCES_DOWNLOADER_INTERVAL);
}

const RESOURCES_TYPES_DOWNLOADERS = {
    "URL": DownloadURLResource,
    "PAGE": DownloadPageResource,
    "UNKNOWN": DownloadUnknownResource
}

const DownloadResource = (resource, index) => {
    const downloader = RESOURCES_TYPES_DOWNLOADERS[resource.downloadOptions.type] || RESOURCES_TYPES_DOWNLOADERS["UNKNOWN"];

    return downloader(resource, index);
}

const DownloadSelectedResources = () => {
    const selector = document.getElementById(RESOURCES_SELECTOR_ID);

    const selected = Array.from(selector.selected);

    selected.forEach((option, index) => {
        const resourceId = Number(option.value);
        const resource = resources.find(resource => resource.id === resourceId);

        DownloadResource(resource, index);
    });
}

// NOTE: run the main function once all the HTML content is loaded
SetupEventListener(document, "DOMContentLoaded", Main);