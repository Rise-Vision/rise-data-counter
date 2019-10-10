import { html } from "@polymer/polymer";
import { RiseElement } from "rise-common-component/src/rise-element.js";
import { version } from "./rise-data-counter-version.js";

export default class RiseDataCounter extends RiseElement {

  static get template() {
    // TODO: this is temporary for skeleton
    return html`<h1>RISE DATA COUNTER</h1>`;
  }

  static get properties() {
    return {
      type: {
        type: String,
        value: "down"
      }
    };
  }

  constructor() {
    super();

    this._setVersion( version );
  }

}

customElements.define("rise-data-counter", RiseDataCounter);
