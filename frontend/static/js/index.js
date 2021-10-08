import Home from "./views/Home.js";
import Artwork from "./views/Artwork.js";
import ArtworkView from "./views/ArtworkView.js"
import AboutMe from "./views/AboutMe.js";

/**
 * Regex function
 * @param path
 * @returns {RegExp}
 */
const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

/**
 * Source the individual artwork post url parameter eg. post 1, 2, 3...
 * @param match
 * @returns {{[p: string]: unknown}}
 */
const getParams = match => {
  //array value 1 is the artwork url parameter
  const values = match.result.slice(1);
  //take result from matchAll iterator, push it into array
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

  //loops through posts, takes multidimensional array and coverts to object
  return Object.fromEntries(keys.map((key, i) => {
      return [key, values[i]];
    }));
};

/**
 * Forward and backwards navigation on single page website
 * This will allow pressing "Back" in the browser and the route being correct
 * @param url
 */
const navigateTo = url => {
    history.pushState(null, null, url);
    router();
}

/**
 * Define routes
 * @returns {Promise<void>}
 */
const router = async () => {
    //console.log(pathToRegex("/posts/:id"));
    const routes = [
        { path: "/", view: Home },
        { path: "/about-me", view: AboutMe },
        { path: "/artwork", view: Artwork },
        { path: "/artwork/:id", view: ArtworkView }
    ];

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        }
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null)

    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname]
        };
    }

    const view = new match.route.view(getParams(match));

    document.querySelector("#app").innerHTML = await view.getHtml();

    //console.log(match.route.view());
    //console.log(match);
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    router();
});