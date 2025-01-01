export const AreWeInMoodleSite = (rawUrl) => {
    return rawUrl.includes("moodle");
}

export const AreWeInMoodleCoursePage = (rawUrl) => {
    return rawUrl.includes("course");
}

export const AreWeInMoodleResourcesSection = (rawUrl) => {
    return rawUrl.includes("resources");
}

export const GetMoodleCourseId = (rawUrl) => {
    const url = new URL(rawUrl);
    const searchParams = url.searchParams;

    return searchParams.get("id");
}

export const GetResourcesPageUrl = (rawUrl, courseId) => {
    const url = new URL(rawUrl);

    return `${url.origin}/course/resources.php?id=${courseId}`;
}