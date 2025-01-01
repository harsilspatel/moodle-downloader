const HIDER_CONTAINER_ID = "hider-container";
const HIDER_TITLE_ID = "hider-title";
const HIDER_DESCRIPTION_ID = "hider-description";
const HIDER_BUTTON_ID = "hider-button";

export const HideHider = () => {
    const hiderContainer = document.getElementById(HIDER_CONTAINER_ID);

    hiderContainer.classList.add("hidden");
    hiderContainer.classList.remove("block");
}

export const DisplayHider = (title, description, buttonText, buttonCallback) => {
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