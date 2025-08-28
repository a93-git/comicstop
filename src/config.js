export const config = {
    appName: "ComicStop",
    apiBaseUrl: "https://api.comicstop.com",
    maxUploadSizeMB: 50,
    supportedFileTypes: [".pdf", ".epub", ".mobi", ".cbz", ".cbr", ".zip"],
    // API endpoints
    endpoints: {
        sections: "/sections",
        sectionComics: "/sections/{sectionId}/comics"
    }
}