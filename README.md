[Example Rise Data Counter](https://github.com/Rise-Vision/html-template-library/tree/master/example-counter-component).
# Rise Data Counter [![CircleCI](https://circleci.com/gh/Rise-Vision/rise-data-counter/tree/master.svg?style=svg)](https://circleci.com/gh/Rise-Vision/rise-data-counter/tree/master) [![Coverage Status](https://coveralls.io/repos/github/Rise-Vision/rise-data-counter/badge.svg?branch=master)](https://coveralls.io/github/Rise-Vision/rise-data-counter?branch=master)

## Introduction

`rise-data-counter` is a Polymer 3 Web Component that provides time based events relative to a target or start date.

## Usage For Designers

The below illustrates simple usage of the component.

### Integration in a Template

A complete setup of the component can be found [here](https://github.com/Rise-Vision/html-template-library/tree/master/example-counter-component).
#### HTML
```
  <rise-data-counter
      id="rise-data-counter-01" label="Countdown" type="down" date="2050-01-01" refresh="60">
  </rise-data-counter>
```
Since this is not a visual component, a listener needs to be registered to process the data it provides. You can check the available events in the [events section](#events).
#### Javascript
```
function configureComponents() {
  _configureCounter();

  console.log( "Rise components ready" );
}

function _configureCounter() {
  //declare counter component
  const riseDataCounter = document.querySelector('#rise-data-counter-01');
  //Counter container
  const daysLabel = document.querySelector('#number');
  const daysContainer = document.querySelector('.container--number');
  //Completion message
  const messageContainer = document.querySelector('.container--reveal');

  riseDataCounter.addEventListener( "data-update", data => {
    //If user declares a sepcific date
    if ( data.detail.date ) {

      daysContainer.style.display = 'block';


    if (!data.detail.date.completed) {

      messageContainer.style.display = 'none';

      //Date with Days, Hours and Minutes

      if ( data.detail.date.difference.days != 0 ) {

        daysLabel.style.display = 'flex';
        daysLabel.innerHTML = data.detail.date.difference.days + `<span class="type-word">DAYS</span>`;

      } 

      //Date with hours and minutes 

      if ( (data.detail.date.duration.hours != 0) && (data.detail.date.difference.days == 0) ) {

        daysLabel.style.display = 'flex';
        daysLabel.innerHTML = data.detail.date.duration.hours + `<span class="type-word">HOURS</span>`;

      } 

      //Date with minutes
      if ( (data.detail.date.duration.minutes != 0 ) && (data.detail.date.duration.hours == 0) && (data.detail.date.difference.days == 0)) {

        daysLabel.style.display = 'flex';
        daysLabel.innerHTML = data.detail.date.duration.minutes + `<span class="type-word">MINUTES</span>`;

      } 
      //if no time left
      if((data.detail.date.duration.minutes == 0 ) && (data.detail.date.duration.hours == 0) && (data.detail.date.difference.days == 0)) {

        daysLabel.style.display = 'none';

      }

    }

  //COMPLETED MESSAGE
    else {

      daysLabel.style.display = 'none';
      daysContainer.style.display = 'none';
      messageContainer.innerHTML = data.detail.date.completion;
      messageContainer.style.display = 'block';

    }
  }
  
  //If user delcares a time everyday.
  //Time with hours, minute and seconds
  else if (data.detail.time) {

       if (!data.detail.time.completed) {
        daysLabel.style.display = 'flex';
        daysContainer.style.display = 'block';
        messageContainer.style.display = 'none';
        if(data.detail.time.difference.minutes >= 60){
          if(data.detail.time.difference.hours == 1 ){
            daysLabel.innerHTML = data.detail.time.difference.hours + ('<span class="type-word"> HOUR</span>');
          }else{
            daysLabel.innerHTML = data.detail.time.difference.hours + ('<span class="type-word"> HOURS</span>');
          }
        }else{
          if(data.detail.time.difference.minutes == 1 ){
            daysLabel.innerHTML = data.detail.time.difference.minutes + ('<span class="type-word"> MINUTE</span>');
          }else{
            daysLabel.innerHTML = data.detail.time.difference.minutes + ('<span class="type-word"> MINUTES</span>');
          }
        }


       } else {

        daysLabel.style.display = 'none';
      daysContainer.style.display = 'none';
      messageContainer.style.display = 'block';
      console.log('Time Config Complete');

       }
    }
  });

  riseDataCounter.addEventListener( "data-error", err => {
    console.log('Error received', err);
  });

  //check if this is needed in production?
  RisePlayerConfiguration.Helpers.sendStartEvent( riseDataCounter );
}
```
#### PACKAGE JSON
No dependency links.

#### Build and Test Locally in Browser 
Uncomment counter helper.

### Label & Help Text
- **Label**:Countdown or Count Up
- **Help Text**:None

### Attributes

This component receives the following list of attributes:

- **id**: (string): Unique HTMLElement id.
- **label**: (string): Assigns the label to use for the instance of the component in Template Editor.
- **type**: (string / required): Indicates the type of the component. Valid values are `down` and `up`.
- **date**: (string / optional): The date value to count up from or down to. Valid format is `YYYY-MM-DD`.
- **time**: (string / optional): The time value to count up from or down to. Valid format is `HH:mm`.
- **completion**: (string / optional): The message to display when the countdown is complete. Only used for a type configuration of `down`.
- **refresh**: (number / optional): The rate at which the component should provide a new timestamp value. Unit is seconds and it defaults to `1`.
- **non-completion**: ( empty /optional ): If present, it indicates the `completion` attribute should not be surfaced as editable to the user in Template Editor. This allows a `completion` value to be set on the instance of the component and it will persist. 
- **non-editable**: ( empty / optional ): If present, it indicates this component is not available for customization in the Template Editor.

### Events

The component sends the following events:

- **configured**: The component has initialized what it requires to and is ready to handle a _start_ event.
- **data-update**: An event providing an object as described [here](#provided-data).
- **data-error**: An event indicating there is a configuration error.

The component listens for the following events:

- **start**: This event will cause the component to start generating events. It can be dispatched to the component when the _configured_ event has been fired.

### Provided data

The **data-update** event provides an object with a `details` property, containing `date` and `time` properties. Each of these contain the following fields:

- type: The type of the counter, `down` or `up`.
- duration: The absolute difference of all the units. If `1` hour and `20` minutes are remaining, then `hours=1` and `minutes=20`.
- difference: The absolute difference of each of the units. If `1` hour and `20` minutes are remaining, then `hours=1` and `minutes=80`.

For `date`, the following properties are available:
- Both `duration` and `difference` contain: `years`, `months`, `weeks`, `days`, `hours`, `minutes`, `seconds`, `milliseconds`.
- The `targetDate` property indicates the date the user or designer chose for this instance.
- The `targetTime` property indicates the time the user or designer chose to combine with the date they chose. If no time was configured, this value will be `undefined`.

For `time`, the following properties are available:
- Both `duration` and `difference` contain: `hours`, `minutes`, `seconds`, `milliseconds`.
- The `targetTime` property indicates the time the user or designer chose for this instance.
- **Note** - `time` will have data populated if no date was configured on the instance. If both date and time were configured on the instance, then the data will be populated in the `date` object and `time` will be `null`.   

For type equals to `down`, the following exclusive properties will be available inside the `details` object:
- `completed`: A boolean indicating the target date/time was reached.
- `completion`: The completion message provided by the user or designer.

For type equals to `up`, the following exclusive properties will be available inside the `details` object:
- `started`: A boolean indicating the target date/time has been reached to start counting up.

### Play Until Done
This component does not support PUD; it will need to be handled by Designers on a per Template basis.

### Logging

The component logs the following events to BQ:

- **start received**: The component receives the start event and commences execution.
- **Invalid type**: The component does now have a type matching either `down` or `up`.
- **Invalid format**: The provided `date` does not match `YYYY-MM-DD` or `time` does not match `HH:mm`.

### Offline play

The component supports offline play out of the box.

## Built With
- [Polymer 3](https://www.polymer-project.org/)
- [Polymer CLI](https://github.com/Polymer/tools/tree/master/packages/cli)
- [WebComponents Polyfill](https://www.webcomponents.org/polyfills/)
- [npm](https://www.npmjs.org)

## Development

### Local Development Build
Clone this repo and change into this project directory.

Execute the following commands in Terminal:

```
npm install
npm install -g polymer-cli@1.9.7
npm run build
```

**Note**: If EPERM errors occur then install polymer-cli using the `--unsafe-perm` flag ( `npm install -g polymer-cli --unsafe-perm` ) and/or using sudo.

### Testing
You can run the suite of tests either by command terminal or interactive via Chrome browser.

#### Command Terminal
Execute the following command in Terminal to run tests:

```
npm run test
```

In case `polymer-cli` was installed globally, the `wct-istanbul` package will also need to be installed globally:

```
npm install -g wct-istanbul
```

#### Local Server
Run the following command in Terminal: `polymer serve`.

Now in your browser, navigate to:

```
http://127.0.0.1:8081/components/rise-data-counter/demo/src/rise-data-counter-dev.html
```

### Demo project

A demo project showing how to implement a simple HH:mm:ss counter can be found in the `demo` folder.

Another option is using `example-counter-component` as the scaffolding for a new template. This project can be found in https://github.com/Rise-Vision/html-template-library

### Integration in a Template

After creating the Template's structure in `html-template-library`, add a reference to the component in the `<head>` section of `template.html`:

```
<script src="https://widgets.risevision.com/stable/components/rise-data-counter/1/rise-data-counter.js"></script>
```

Add an instance of the component, as shown in the example:

```
  <rise-data-counter
      id="rise-data-counter-01" label="Count Down" type="down" date="2050-01-01" refresh="60">
  </rise-data-counter>
```

To test the template in a browser outside Player/Apps, add the following lines (replacing with the appropriate element id):

```
const riseDataCounter01 = document.querySelector('#rise-data-counter-01');

RisePlayerConfiguration.Helpers.sendStartEvent( riseDataCounter01 );
```

## Submitting Issues
If you encounter problems or find defects we really want to hear about them. If you could take the time to add them as issues to this Repository it would be most appreciated. When reporting issues, please use the following format where applicable:

**Reproduction Steps**

1. did this
2. then that
3. followed by this (screenshots / video captures always help)

**Expected Results**

What you expected to happen.

**Actual Results**

What actually happened. (screenshots / video captures always help)

## Contributing
All contributions are greatly appreciated and welcome! If you would first like to sound out your contribution ideas, please post your thoughts to our [community](https://help.risevision.com/hc/en-us/community/topics), otherwise submit a pull request and we will do our best to incorporate it. Please be sure to submit test cases with your code changes where appropriate.

## Resources
If you have any questions or problems, please don't hesitate to join our lively and responsive [community](https://help.risevision.com/hc/en-us/community/topics).

If you are looking for help with Rise Vision, please see [Help Center](https://help.risevision.com/hc/en-us).

**Facilitator**

[Stuart Lees](https://github.com/stulees "Stuart Lees")
