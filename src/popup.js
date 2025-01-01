/**
 * moodleDownloader - a chrome extension for batch downloading Moodle resources 💾
 * Copyright (c) 2018 Harsil Patel
 * https://github.com/harsilspatel/MoodleDownloader
 */

// TODO: re-implement google analytics.

// TODO: completely block the extension if we are not in a moodle page, to start with check that the url contains "moodle" in it, then make it more sofisticated by checking the page content, etc.
// TODO: if the person isn't in a moodle page, display a blur with a message, but still give the option to display the extension and download in case the system hasn't been able to detect the moodle page.
// TODO: give the choice for the user to manually enter the moodle course id, and then scrape the resources from the resources page.
// TODO: give instructions, like some note with instructions that redirect to a video or something that shows how to download.
// TODO: display the blur thing with a different message when the user is in a moodle site but not in a course page.

const BACKGROUND_SCRIPT_FILE_PATH = "./src/background.js";

const RESOURCES_SELECTOR_ID = "resources-selector";
const MAIN_BUTTON_ID = "main-button";
const RESOURCES_SEARCH_INPUT_ID = "search";

const HIDER_CONTAINER_ID = "hider-container";
const HIDER_TITLE_ID = "hider-title";
const HIDER_DESCRIPTION_ID = "hider-description";
const HIDER_BUTTON_ID = "hider-button";

let resources = [];

const HideHider = () => {
    const hiderContainer = document.getElementById(HIDER_CONTAINER_ID);

    hiderContainer.classList.add("hidden");
    hiderContainer.classList.remove("block");
}

const DisplayHider = (title, description, buttonText, buttonCallback) => {
    const hiderContainer = document.getElementById(HIDER_CONTAINER_ID);

    // NOTE: important to be over here otherwise the getElementById will return null for the below elements
    hiderContainer.classList.add("block");
    hiderContainer.classList.remove("hidden");

    const hiderTitle = document.getElementById(HIDER_TITLE_ID);
    const hiderDescription = document.getElementById(HIDER_DESCRIPTION_ID);
    const hiderButton = document.getElementById(HIDER_BUTTON_ID);

    hiderTitle.innerText = title;
    hiderDescription.innerText = description;
    hiderButton.innerText = buttonText;

    hiderButton.onclick = buttonCallback;

    return hiderContainer;
}

const SetupEventListener = (element, event, callback) => {
    element.addEventListener(event, callback);
}

const PopulateSelector = (resources, selector, selectAll = true) => {
    resources.forEach((resource, index) => {
        const option = document.createElement("option");

        option.value = resource.id;
        option.title = resource.name;
        option.innerHTML = resource.name;

        if (selectAll)
            option.selected = true;

        selector.appendChild(option);
    });

    return resources;
}

const AreWeInMoodleSite = (rawUrl) => {
    return rawUrl.includes("moodle");
}

const AreWeInMoodleCoursePage = (rawUrl) => {
    return rawUrl.includes("course");
}

const AreWeInMoodleResourcesSection = (rawUrl) => {
    return rawUrl.includes("resources");
}

const GetMoodleCourseId = (rawUrl) => {
    const url = new URL(rawUrl);
    const searchParams = url.searchParams;

    return searchParams.get("id");
}

const GetResourcesPageUrl = (rawUrl, courseId) => {
    const url = new URL(rawUrl);

    return `${url.origin}/course/resources.php?id=${courseId}`;
}

const GoToResourcesPage = (rawUrl, courseId) => {
    const resourcesPageUrl = GetResourcesPageUrl(rawUrl, courseId);

    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { url: resourcesPageUrl });

                resolve(true)
            } else {
                reject("No active tab found.");
            }
        });
    });
}

const GetActiveTabUrl = () => {
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

const LoadResources = () => {
    return new Promise((resolve, reject) => {
        chrome.tabs.executeScript({ file: BACKGROUND_SCRIPT_FILE_PATH }, result => {
            if (chrome.runtime.lastError)
                reject(`[error]: from background.js script execution.`, chrome.runtime.lastError.message);
            else
                resolve(result[0]);
        });
    });
}


// NOTE: if the main function is executed, assume we are already in a moodle course page but not necessarily in the resources page.
const Main = async () => {
    const button = document.getElementById(MAIN_BUTTON_ID);
    const input = document.getElementById(RESOURCES_SEARCH_INPUT_ID);

    SetupEventListener(input, "input", FilterOptions);

    const tabUrl = await GetActiveTabUrl();

    if (!AreWeInMoodleSite(tabUrl)) {
        console.error("[moodle-downloader]: you are not in a Moodle site.");

        DisplayHider(
            "Not a Moodle Site",
            "You are not in a Moodle site. Please navigate to a Moodle site and then click the button.",
            "Still Proceed",
            HideHider
        )

        return;
    }

    if (!AreWeInMoodleCoursePage(tabUrl)) {
        console.error("[moodle-downloader]: you are not in a Moodle course page.");

        DisplayHider(
            "Not a Moodle Course Page",
            "You are not in a Moodle course page. Please navigate to the Moodle course page you want to download the resources from.",
            "Still Proceed",
            HideHider
        )

        return;
    }

    HideHider()

    if (!AreWeInMoodleResourcesSection(tabUrl)) {
        button.removeAttribute("disabled");
        button.innerText = "Go to the Resources Page";

        SetupEventListener(button, "click", async () => {
            await GoToResourcesPage(tabUrl, GetMoodleCourseId(tabUrl));

            resources = await LoadResources();

            PopulateSelector(resources, document.getElementById(RESOURCES_SELECTOR_ID));
        });
    } else {
        button.removeAttribute("disabled");
        button.innerText = "Download Selected Resources";

        resources = await LoadResources();

        PopulateSelector(resources, document.getElementById(RESOURCES_SELECTOR_ID));

        SetupEventListener(button, "click", DownloadSelectedResources);
    }

}

const FilterOptions = () => {
    const search = document.getElementById(RESOURCES_SEARCH_INPUT_ID);
    const query = search.value.toLowerCase();
    const regex = new RegExp(query, "i");

    const options = Array.from(document.getElementById(RESOURCES_SELECTOR_ID).options);

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

    const response = await fetch(url);

    if (!response.ok) {
        console.error(`[url-downloader]: failed to download "${url}".`);
        return null;
    }

    const blob = await response.blob();

    return blob;
}

const DownloadUnknownResource = (resource, index) => {
    console.error("[unknown-downloader]: downloading resource.");
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

const GenerateZipFilename = () => {
    const date = new Date();

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `resources-${day}-${month}-${year}-${hours}-${minutes}-${seconds}.zip`;
}

const DownloadSelectedResources = async () => {
    const zip = new JSZip();

    const selector = document.getElementById(RESOURCES_SELECTOR_ID);

    const selectedResourcesIds = Array.from(selector.selectedOptions).map(option => option.value);

    selectedResourcesIds.forEach((selectedResourceId, index) => {
        const resource = resources.find(resource => resource.id === parseInt(selectedResourceId));

        const resourceBlobs = DownloadResource(resource, index);

        resourceBlobs.forEach((blob, subIndex) => {
            zip.file(`${resource.name}_${subIndex}.pdf`, blob);
        });
    })

    const blob = await zip.generateAsync({ type: "blob" });

    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
        url: url,
        filename: GenerateZipFilename(),
    });
}

// NOTE: run the main function once all the HTML content is loaded
SetupEventListener(document, "DOMContentLoaded", Main);