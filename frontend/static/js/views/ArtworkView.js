import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    id;
    constructor(params, artwork) {
        super(params, artwork);
        this.setTitle("Viewing post: " + artwork.title);
    }

    async getHtml() {
        console.log(this.params.id);
        return `
            <h1> Viewing post </h1>
            <p>
                Post
            </p>
        `;
    }

    async getArtwork(artwork) {
        return document.body.appendChild(artwork);
    }

    async setId(id) {
        this.id = id;
    }

    getId() {
        return this.id;
    }
}