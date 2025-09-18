export const config = {
    appName: "ComicStop",
    apiBaseUrl: process.env.NODE_ENV === 'production' 
        ? "https://api.comicstop.com" 
        : "http://localhost:3001",
    maxUploadSizeMB: 50,
    supportedFileTypes: [".pdf", ".epub", ".mobi", ".cbz", ".cbr", ".zip", ".jpg", ".jpeg", ".png", ".webp"],
    // API endpoints
    endpoints: {
        // Comics endpoints
        comics: "/api/comics",
        comicById: "/api/comics/{id}",
        myComics: "/api/comics/my",
        uploadComic: "/api/comics/upload",
        
        // Auth endpoints
    signup: "/api/auth/signup",
    login: "/api/auth/login",
    profile: "/api/auth/profile",
    settings: "/api/auth/settings",
    logout: "/api/auth/logout",
        
        // Bookmark endpoints
    bookmarks: "/api/bookmarks",
    addBookmark: "/api/bookmarks",
    toggleBookmark: "/api/bookmarks/toggle",
    checkBookmark: "/api/bookmarks/check",
    removeBookmark: "/api/bookmarks/{id}",
        
        // Legacy endpoints (for backward compatibility)
        sections: "/api/comics", // Map sections to comics endpoint
        sectionComics: "/api/comics" // Map section comics to comics endpoint
    }
}