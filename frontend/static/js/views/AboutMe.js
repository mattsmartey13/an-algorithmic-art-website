import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("About me");
    }

    async getHtml() {
        return `
            <h1> Hello and welcome to my art website</h1>
            <p>
                I am an aspiring computer programmer having returned from my placement year. During that time I have worked as a 
                PHP and Java developer, working on bug fixes for our company product used by Service Desk and 75% of our clients.
                I have learned to use Docker, Jira, RabbitMQ, SonarQube, SOAPUI and MySQL Workbench
                After returning from placement I felt like I needed a new challenge for my final year project. I have chosen front-end web
                development as a second year module, but I also wanted a frontend final year project as a way to show off my creative mind.
            </p>
            <p>
                My artwork is predominantly based on patterns and symbols I like or am intrigued by, such as mandalas and patterns found in nature.
                I also thoroughly enjoy combat sports, and hope to post a couple of pieces of work related to that.
            </p>
        `;
    }
}