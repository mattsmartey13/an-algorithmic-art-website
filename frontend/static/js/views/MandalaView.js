import Mandala from "../artwork/Mandala.js";
import ArtworkView from "./ArtworkView.js";

export default class extends ArtworkView {
    constructor(params, artwork) {
        super(params, artwork);
        this.getArtwork(Mandala.getArtwork())
        this.setId(1);
    }


}