import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Artwork");
    }

    async getHtml() {
        return `
            <h1> My artwork </h1>
            <p>
                Below you will see some artwork I have created in the last 9 months.
                Part is based on symbolism and patterns that I appreciate, predominantly mandalas and shapes found in nature.
                Some of my work is also based on combat sports, one of my passions. 
            </p>
        `;
    }
}