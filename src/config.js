export const config = {
    appName: "ComicStop",
    apiBaseUrl: process.env.NODE_ENV === 'production' 
        ? "https://api.comicstop.com" 
        : "http://localhost:3001/api",
    maxUploadSizeMB: 50,
    supportedFileTypes: [".pdf", ".epub", ".mobi", ".cbz", ".cbr", ".zip"],
    // API endpoints
    endpoints: {
        // Comics endpoints
        comics: "/comics",
        comicById: "/comics/{id}",
        myComics: "/comics/my",
        uploadComic: "/comics/upload",
        
        // Auth endpoints
        signup: "/auth/signup",
        login: "/auth/login",
        profile: "/auth/profile",
        logout: "/auth/logout",
        
        // Legacy endpoints (for backward compatibility)
        sections: "/comics", // Map sections to comics endpoint
        sectionComics: "/comics" // Map section comics to comics endpoint
    }
}