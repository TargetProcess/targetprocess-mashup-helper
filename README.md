# targetprocess-mashup-helper

API wrapper for more convinient writing of Targetprocess mashups.

[![Build Status](https://travis-ci.org/TargetProcess/targetprocess-mashup-helper.svg?branch=master)](https://travis-ci.org/TargetProcess/targetprocess-mashup-helper)

## Installation

`npm install targetprocess-mashup-helper`

## Usage

```js
var helper = require('targetprocess-mashup-helper')
```

You can require separate modules to decrease package size

```js
var customUnits = require('targetprocess-mashup-helper/lib/customUnits')
```


## API

### `.addBusListener`

Alias to `.events.addBusListener`.

### `.addBusListenerOnce`

Alias to `.events.addBusListenerOnce`.

### `.getAppConfigurator`

Alias to `.configurator.getAppConfigurator`.

### `.events`

#### `.addBusListener(busName, eventName, listener, isOnce)`

Add listener to component bus by name.

```js
helper.events.addBusListener('description', 'afterRender', function(e, renderData) {
    //...
});
```

#### `.addBusListenerOnce(busName, eventName, callback)`

Same as `.addBusListener(busName, eventName, callback, true)`.

### `.configurator`

#### `.getAppConfigurator() => Promise<Configurator>`

Get application configurator and returns its promise.

```js
helper.configurator.getAppConfigurator().then(function(configurator) {
    // ...
});
```

### `.customUnits`

#### `.types` 

Hash of constants to configure entity types custom unit is applied to.

#### `.sizes` 

Hash of constants to configure card sizes custom unit is applied to.

#### `.add(config) => Promise`

Add custom unit to registry, make it allowed to add to card.

Config:

* `id` (string) unit unique id.
* `name` (string) name in library.
* `outerClassName` (string | function) class name of unit wrapper for best styling.
* `template` (object | string) template config, will be used as `template.markup` if string.
    * `markup` (string) unit output in `jqote` format. Has access to unit data as `this.data`. E.g. `<div class="tau-board-unit__value"><%= this.data.value %></div>`. Wrap template with class to get quick output `tau-board-unit__value`.
    * `customFunctions` (object) map of functions, which will be accessible inside template as `<%= fn.someCustomFunction() %>`. 
* `model` (object | string) data config, maps result of select query to data. E.g: `{title: "title"}`, result data will be `{title: <title of entity>}`
* `sampleData` (object | string) sample data will be passed to unit template when using in library
* `types` (array) list of entity types of cards, where unit accessible, all types by default. Use `customUnits.types` as values.
* `sizes` (array) list of card sizes where unit is accessible, all sizes by default. Use `customUnits.sizes` as values.
* `priority` (number) order of custom unit in customize card tab (more is closer to an end, can use negative).
* `hideIf` (function) check if unit will be hide entirely from card, e.g. if there is no data.
* `isEditable` (boolean | function) check if unit is editable
* `editorComponentName` (string | function) name of editor component
* `editorData` (object | function) transform unit data to editor data, by default pass unit data as is.

##### Examples

###### Simple static unit

```js

helper.customUnits.add({
    id: 'good_field',
    name: 'Good Field',
    template: '<div class="tau-board-unit__value"><%= this.data.value %></div>',
    model: {
        value: '"Hello there"'
    },
    sampleData: {
        value: '"Hello from library"'    
    }
});
```

###### Unit outputs entity state name on small cards for bugs and user stories

```js
helper.customUnits.add({
    id: 'my_entity_state',
    name: 'My Entity State',
    template: '<div class="tau-board-unit__value"><%= this.data.entityState.id %> <%= this.data.entityState.name %></div>',
    model: {
        entityState: 'entityState'
    },
    sampleData: {
        entityState: {
            id: 12,
            name: 'In Progress'
        }
    },
    sizes: [cu.sizes.S],
    types: [cu.types.STORY, cu.types.BUG]

});
```

###### Unit outputs and allow to edit custom field with name 'ESPN'

```js
helper.customUnits.add({
    id: 'espn_custom_field',
    name: 'ESPN',
    template: '<div class="tau-board-unit__value">ESPN: <%= this.data.customField.value %></div>',
    hideIf: function(data) {
        return !data.customField;
    },
    model: {
        customField: 'CustomValues.Get("ESPN")'
    },
    sampleData: {
        customField: {
            value: '231231224'
        }
    },
    isEditable: true,
    editorComponentName: 'customField.text.editor',
    editorData: function(data) {
        return {
            cf: data.customField
        };
    }
});
```

### `.debug`

#### `.showComponentsNames()`

Add attribute `data-component-name` to component top DOM element for better debugging or using inside `.addBusListener` function.

#### `.logBus(predicate, logger)`

Output events and data of particular buses. `predicate` can be a string -- name or id of bus (can be found after call of `debug.showComponentsNames()`), function `(bus, eventName, data)` or if is ommitted, all events of all buses will be logged. `logger` is a function of `(busName, eventName, data)`, it writes to `console.log`. by default.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
