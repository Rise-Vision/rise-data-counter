/* eslint-disable no-console, no-unused-vars */

import { RiseElement } from "rise-common-component/src/rise-element.js";
import { timeOut } from "@polymer/polymer/lib/utils/async.js";
import { Debouncer } from "@polymer/polymer/lib/utils/debounce.js";
import moment from "moment";
import { version } from "./rise-data-counter-version.js";

export default class RiseDataCounter extends RiseElement {

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

  static get MOMENT_DATE_UNITS() {
    return ["years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
  }

  static get MOMENT_TIME_UNITS() {
    return ["hours", "minutes", "seconds", "milliseconds"];
  }

  constructor() {
    super();

    this._setVersion( version );
    this._initialStart = true;
    this._refreshDebounceJob = null;
    this._dateDuration = null;
    this._timeDuration = null;
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
      super.log( "error", "Invalid type", { type: this.type } );
      this._sendCounterEvent( RiseDataCounter.EVENT_DATA_ERROR, {
        message: "Invalid type, valid values are 'down' and 'up'",
        type: this.type
      } );
      return;
    }

    if ( !this._hasValidFormat() ) {
      // only log error if date or time is not empty
      if ( this.date || this.time ) {
        super.log( "error", "Invalid format", { date: this.date, time: this.time } );
        this._sendCounterEvent( RiseDataCounter.EVENT_DATA_ERROR, {
          message: "Invalid format, valid date is YYYY-MM-DD and valid time is HH:mm",
          date: this.date,
          time: this.time
        } );
      }

      return;
    }

    this.date && this._initializeDateDuration( this.date, this.type );
    !this.date && this.time && this._initializeTimeDuration( this.time, this.type );

    this._processCount( true );
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

  _formatMomentJSMonth( month ) {
    if ( !month || isNaN( month ) || month < 0 || month > 11) {
      return "";
    }

    // momentjs month is zero indexed based
    month += 1;

    if ( month < 10 ) {
      return `0${ month }`
    }

    return month;
  }

  _initializeDateDuration( targetDate, type ) {
    const targetDateInMS = moment( targetDate, "YYYY-MM-DD" ).valueOf(),
      currentDateInMS = moment().valueOf(),
      calculation = type === RiseDataCounter.TYPE_DOWN ? targetDateInMS - currentDateInMS : currentDateInMS - targetDateInMS;

    this._dateDuration = moment.duration(calculation, "milliseconds");
  }

  _initializeTimeDuration( targetTime, type ) {
    const current = moment(),
      target = moment( `${ current.year() }-${ this._formatMomentJSMonth( current.month() ) }-${current.date()}T${ targetTime }`, "YYYY-MM-DDTHH:mm" ),
      targetTimeInMS = target.valueOf(),
      currentTimeInMS = current.valueOf(),
      calculation = type === RiseDataCounter.TYPE_DOWN ? targetTimeInMS - currentTimeInMS : currentTimeInMS - targetTimeInMS;

    this._timeDuration = moment.duration(calculation, "milliseconds");
  }

  _updateDateDuration( intervalMS, type ) {
    const calculation = type === RiseDataCounter.TYPE_DOWN ? this._dateDuration - intervalMS : this._dateDuration + intervalMS;

    this._dateDuration = moment.duration(calculation, "milliseconds");
  }

  _updateTimeDuration( intervalMS, type ) {
    const calculation = type === RiseDataCounter.TYPE_DOWN ? this._timeDuration - intervalMS : this._timeDuration + intervalMS;

    this._timeDuration = moment.duration(calculation, "milliseconds");
  }

  _getDateDurationFormatted() {
    return RiseDataCounter.MOMENT_DATE_UNITS.reduce( (duration, unit) => {
      duration[ unit ] = this._dateDuration[unit]();
      return duration;
    }, {});
  }

  _getTimeDurationFormatted() {
    return RiseDataCounter.MOMENT_TIME_UNITS.reduce( (duration, unit) => {
      duration[ unit ] = this._timeDuration[unit]();
      return duration;
    }, {});
  }

  _getDateDifferenceFormatted( targetDate, type ) {
    const now = moment(),
      event = moment( targetDate, "YYYY-MM-DD" );

    function getValue( unit ) {
      return type === RiseDataCounter.TYPE_DOWN ? event.diff( now, unit ) : now.diff( event, unit );
    }

    return RiseDataCounter.MOMENT_DATE_UNITS.reduce( (difference, unit) => {
      difference[ unit ] = getValue( unit );
      return difference;
    }, {});
  }

  _getTimeDifferenceFormatted( targetTime, type ) {
    const now = moment(),
      event = moment( `${ now.year() }-${ this._formatMomentJSMonth( now.month() ) }-${now.date()}T${ targetTime }`, "YYYY-MM-DDTHH:mm" );

    function getValue( unit ) {
      return type === RiseDataCounter.TYPE_DOWN ? event.diff( now, unit ) : now.diff( event, unit );
    }

    return RiseDataCounter.MOMENT_TIME_UNITS.reduce( (difference, unit) => {
      difference[ unit ] = getValue( unit );
      return difference;
    }, {});
  }

  _isOutOfRange( units ) {
    for ( let [ key, value] of Object.entries( units ) ) {
      if (value < 0) {
        return true;
      }
    }

    return false;
  }

  _getStatus( type, units ) {
    const data = {};

    if ( type === "down" ) {
      data.completed = this._isOutOfRange( units );
      data.completion = this.completion;
    }

    if ( type === "up" ) {
      data.started = !this._isOutOfRange( units );
    }

    return data;
  }

  _getDateData( ignoreDurationUpdate = false ) {
    const data = { targetDate: this.date, type: `count ${this.type}` };

    !ignoreDurationUpdate && this._updateDateDuration( this.refresh * 1000, this.type );

    data.difference = this._getDateDifferenceFormatted( this.date, this.type );
    data.duration = this._getDateDurationFormatted();

    const rangeData = this._getStatus( this.type, data.difference );

    return Object.assign( {}, data, rangeData );
  }

  _getTimeData( ignoreDurationUpdate = false ) {
    const data = { targetTime: this.time, type: `count ${this.type}` };

    !ignoreDurationUpdate && this._updateTimeDuration( this.refresh * 1000, this.type );

    data.difference = this._getTimeDifferenceFormatted( this.time, this.type );
    data.duration = this._getTimeDurationFormatted();

    const rangeData = this._getStatus( this.type, data.difference );

    return Object.assign( data, rangeData );
  }

  _processCount( start = false ) {
    const data = {};

    data.date = this.date ? this._getDateData( start ) : null;
    data.time = !this.date && this.time ? this._getTimeData( start ) : null;

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
