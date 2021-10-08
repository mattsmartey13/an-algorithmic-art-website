import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Home");
    }

    async getHtml() {
        return `
            <h1> An algorithmic art website using Vanilla JavaScript</h1>
            <p>
                This is the final year project I have chosen for my BSc Computer Science Hons.
                I have chosen this as I wanted a web development based project which was challenging while at the same time capturing artistically my interest in patterns and symbols. 
            </p>
            <p>
                <a href="/about-me" data-link>Read more about me</a>
                <a href="/artwork" data-link>View some of my artwork</a>
            </p>
        `;
    }
}