class Router {
    constructor(routes) {
        this.routes = routes;
        this._loadInitialRoute();
    }

    /**
     * Load route method
     * Spread syntax in parameters will take all urlSegments array elements as individual values
     * @param urlSegments
     */
    loadRoute(...urlSegments) {
        /**
         * Get template for the given route using helper method
         */
        const matchedRoute = this._matchUrlToRoute(urlSegments);

        /**
         * Push a history entry with the new url
         * Empty object and string as first two arguments - they are not necessary as long as the URL is pushed
         * This will combine domain with page as one URL
         */
        const url = `/${urlSegments.join('/')}`;
        history.pushState({}, '', url);

        /**
         * Append the given HTML template to the DOM inside the router outlet
         */
        const content = document.querySelectorAll('[content]')[0];
        content.innerHTML = matchedRoute.getView(matchedRoute.params);
    }

    /**
     * Helper method to try match URL to route
     * @param urlSegments
     * @private
     */
    _matchUrlToRoute(urlSegments) {
        const routeParams = {};
        const matchedRoute = this.routes.find(route => {
            /**
             * Assume that the route always starts with a slash,
             * so the first item (index 0) in the segments array will always be an empty string,
             * index 1 will therefore ignore the empty string.
             */
            const routePathSegments = route.path.split('/').slice(1);
            if (routePathSegments.length !== urlSegments.length) {
                return false;
            }

            /**
             * If the URL segment matches the corresponding route segment,
             * or the route segment contains a colon (individual artwork posts), the route is matched
             */
            const match = routePathSegments.every((routePathSegment, i) => {
                return routePathSegment === urlSegments[i] || routePathSegment[0] === ':';
            });

            /**
             * Get the URL component if we are viewing the HTML template of an artwork post
             * Return match boolean value regardless
             */
            if (match) {
                routePathSegments.forEach((segment, i) => {
                    if (segment[0] === ':') {
                        const subSegment = segment.slice(1);
                        routeParams[subSegment] = decodeURIComponent(urlSegments[i]);
                    }
                });
            }
            return match;
        });

        /**
         * Return the matched route with its parameters
         */
        return { ...matchedRoute, params: routeParams };
    }

    /**
     * Helper method within constructor to return the initial route
     * This will be used if the user refreshes the browser page
     * Ternary operator used to set the path segment value
     *
     * @private
     */
    _loadInitialRoute() {
        const pathnameSplit = window.location.pathname.split('/');
        const pathSegments = pathnameSplit.length > 1 ? pathnameSplit.slice(1) : '';
        this.loadRoute(...pathSegments);
    }
}