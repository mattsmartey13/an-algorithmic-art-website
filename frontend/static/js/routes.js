let directory = 'frontend/static/html';

/**
 * Define routes
 */
const routes = [
    {
        path: '/',
        getView: (params) => loadHTML(concatenateUrl('views/home.html'))
    },
    {
        path: '/about-me',
        getView: (params) => loadHTML(concatenateUrl('views/aboutme.html'))
    },
    {
        path: '/artwork-home',
        getView: (params) => loadHTML(concatenateUrl('views/artworkhome.html'))
    },
    {
        path: '/artwork-mandala',
        getView: (params) => loadHTML(concatenateUrl('artwork/mandala.html'))
    },
    {
        path: '/artwork-lindenmayer',
        getView: (params) => loadHTML(concatenateUrl('artwork/lindenmayer.html'))
    },
    {
        path: '/artwork-experimental-lindenmayer',
        getView: (params) => loadHTML(concatenateUrl('artwork/experimentl-system.html'))
    },
    {
        path: '/artwork-garden',
        getView: (params) => loadHTML(concatenateUrl('artwork/garden-lsystem.html'))
    }
];

/**
 * Helper method to load HTML file into the div "content" element (view)
 * GET request to fetch html file
 * Throw error if file not found
 *
 * @param pathToHTML
 */
function loadHTML(pathToHTML) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', pathToHTML, true);
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return;
        if (this.status !== 200) return;
        document.getElementById('content').innerHTML= this.responseText;
    };
    xhr.send();
}

function concatenateUrl(filename) {
    return [directory, filename].join('/');
}