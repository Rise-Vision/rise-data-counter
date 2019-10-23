/* eslint-disable no-console */

import { html } from "@polymer/polymer";
import { RiseElement } from "rise-common-component/src/rise-element.js";
import { timeOut } from "@polymer/polymer/lib/utils/async.js";
import { Debouncer } from "@polymer/polymer/lib/utils/debounce.js";
import moment from "moment";
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
      "_reset(date, time, completion)"
    ];
  }

  // Event name constants
  static get EVENT_DATA_UPDATE() {
    return "data-update";
  }

  static get EVENT_DATA_ERROR() {
    return "data-error";
  }

  static get EVENT_RESET() {
    return "data-counter-reset";
  }

  static get TYPE_DOWN() {
    return "down";
  }

  static get TYPE_UP() {
    return "up";
  }

  static get MOMENT_UNITS() {
    return ["years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
  }

  constructor() {
    super();

    this._setVersion( version );
    this._initialStart = true;
    this._refreshDebounceJob = null;
    this._dateDuration = null;
  }

  ready() {
    super.ready();

    this.addEventListener( "rise-presentation-play", () => this._reset());
    this.addEventListener( "rise-presentation-stop", () => this._stop());
  }

  _reset() {
    if ( !this._initialStart ) {
      this._stop();
      this._start();
    }
  }

  _isValidType( type ) {
    return type === RiseDataCounter.TYPE_UP || type === RiseDataCounter.TYPE_DOWN;
  }

  _isValidDate( date ) {
    return( moment( date, "YYYY-MM-DD", true ).isValid() );
  }

  _isValidTime( time ) {
    return( moment( time, "HH:mm", true ).isValid() );
  }

  _hasValidFormat() {
    if ( !this.date && !this.time ) {
      return false;
    }

    if ( this.date ) {
      // default on using date value if for some reason time is also provided
      return this._isValidDate( this.date );
    }

    if ( this.time ) {
      return this._isValidTime( this.time );
    }
  }

  _start() {
    if ( !this._isValidType( this.type ) ) {
      // TODO: log error
      return;
    }

    if ( !this._hasValidFormat() ) {
      // TODO: only log error if date or time has a value
      return;
    }

    this.date && this._initializeDateDuration( this.date, this.type );

    this._runTimer( this.refresh );
  }

  _stop() {
    this._refreshDebounceJob && this._refreshDebounceJob.cancel();
    this._dateDuration = null;
  }

  _sendCounterEvent( eventName, detail ) {
    super._sendEvent( eventName, detail );

    switch ( eventName ) {
      case RiseDataCounter.EVENT_DATA_ERROR:
        super._setUptimeError( true );
        break;
      case RiseDataCounter.EVENT_DATA_UPDATE:
        super._setUptimeError( false );
        break;
      default:
    }
  }

  _initializeDateDuration( targetDate, type ) {
    const targetDateInMS = moment( targetDate, "YYYY-MM-DD" ).valueOf(),
      currentDateInMS = moment().valueOf(),
      calculation = type === RiseDataCounter.TYPE_DOWN ? targetDateInMS - currentDateInMS : currentDateInMS - targetDateInMS;

    this._dateDuration = moment.duration(calculation, "milliseconds");
  }

  _updateDateDuration( intervalMS, type ) {
    const calculation = type === RiseDataCounter.TYPE_DOWN ? this._dateDuration - intervalMS : this._dateDuration + intervalMS;

    this._dateDuration = moment.duration(calculation, "milliseconds");
  }

  _getDateDurationFormatted() {
    return RiseDataCounter.MOMENT_UNITS.reduce( (duration, unit) => {
      duration[ unit ] = this._dateDuration[unit]();
      return duration;
    }, {});
  }

  _getDateDifferenceFormatted( targetDate, type ) {
    const now = moment(),
      event = moment( targetDate, "YYYY-MM-DD" );

    function getValue( unit ) {
      return type === RiseDataCounter.TYPE_DOWN ? event.diff( now, unit ) : now.diff( event, unit );
    }

    return RiseDataCounter.MOMENT_UNITS.reduce( (difference, unit) => {
      difference[ unit ] = getValue( unit );
      return difference;
    }, {});
  }

  _getDateData() {
    const data = { targetDate: this.date, type: `count ${this.type}` };

    this._updateDateDuration( this.refresh * 1000, this.type );

    data.difference = this._getDateDifferenceFormatted( this.date, this.type );
    data.duration = this._getDateDurationFormatted();

    return data;
  }

  _getTimeData() {
    // TODO
    return {};
  }

  _processCount() {
    const data = {};

    data.date = this.date ? this._getDateData() : null;
    data.time = !this.date && this.time ? this._getTimeData() : null;

    this._sendCounterEvent( RiseDataCounter.EVENT_DATA_UPDATE, data );
    this._runTimer( this.refresh );
  }

  _runTimer( interval ) {
    interval = parseInt( interval, 10 );

    if ( !isNaN( interval ) && interval > 0 ) {
      this._refreshDebounceJob = Debouncer.debounce( this._refreshDebounceJob, timeOut.after( interval * 1000 ), () => this._processCount() );
    }
  }

  _handleStart() {
    super._handleStart();

    if (this._initialStart) {
      this._initialStart = false;

      this._start();
    }
  }
}

customElements.define("rise-data-counter", RiseDataCounter);
