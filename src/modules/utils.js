const DEFAULT_PREFIX = "resources";

export const GenerateZipFilename = (prefix = DEFAULT_PREFIX) => {
    const date = new Date();

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `resources-${day}-${month}-${year}-${hours}-${minutes}-${seconds}.zip`;
}