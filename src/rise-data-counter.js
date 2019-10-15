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
      /**
       * The direction this instance should be configured to count for. Valid values are "down" and "up".
       */
      type: {
        type: String,
        value: "down"
      },
      /**
       * The date value to count up from or down to. Valid format is YYYY-MM-DD.
       */
      date: {
        type: String
      },
      /**
       * The time value to count up from or down to. Valid format is HH:mm.
       */
      time: {
        type: String
      },
      /**
       * The message to display when the countdown is complete. Only used for a type configuration of down.
       */
      completion: {
        type: String
      },
      /**
       * The rate at which the component should provide a new timestamp value. Unit is seconds.
       */
      refresh: {
        type: Number,
        value: 1
      }
    };
  }

  // Each item of observers array is a method name followed by
  // a comma-separated list of one or more dependencies.
  static get observers() {
    return [
      "_reset(type, date, time, completion, refresh)"
    ];
  }

  constructor() {
    super();

    this._setVersion( version );
  }

  _reset() {

  }
}

customElements.define("rise-data-counter", RiseDataCounter);
