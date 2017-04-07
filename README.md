# Config-burger

Compose a configuration file like it was a burger, with all the layers you like, yum yum!

## Create a registry
You create an empty registry passing an array of strings. These are the conditions that should be checked to decide to use or not a specific layer. The order of the conditions determine the priority.
```js
var Registry = require('config-burger');

var reg = new Registry(['vegetarian', 'hot']);
```
You can then load an array of "layers" in the registry:
```js
reg.loadConfig([
  {
    bread: 'toasted bread',
    main: 'rare beef burger',
    condiment: 'mayo',
  },
  {
    vegetarian: 'yes',
    main: 'soya burger'
  },
  {
    hot: 'hot',
    condiment: 'jalapeno pepper'
  },
  {
    hot: 'very hot',
    main: 'fiery buffalo burger'
  }
]);
```

## Getting the configuration
A layer can have no conditions at all (like the first one). In this case it is always used.
If it contains a condition is going to be used to compose the final object. Some example:
```js
reg.getConfig({})
.then(function (config) {
  // config is
  // {
  //   bread: 'toasted bread',
  //   main: 'rare beef burger',
  //   condiment: 'mayo'
  // }
});  
```
In this case I am not passing any condition to getConfig. The only matching is layer is the one without conditions.
```js
reg.getConfig({ vegetarian: 'yes' })
.then(function (config) {
  // config is
  // {
  //   bread: 'toasted bread',
  //   main: 'soya burger',
  //   condiment: 'mayo'
  // }
});  
```
In this other case I match both the generic layer and the vegetarian one. Note: the condition is removed from the final result and the 2 layers are merged together.
```js
reg.getConfig({ vegetarian: 'yes', hot: 'hot' })
.then(function (config) {
  // config is
  // {
  //   bread: 'toasted bread',
  //   main: 'soya burger',
  //   condiment: 'jalapeno pepper'
  // }
});  
```
In this case the conditions match 3 layers: the generic one, the vegetarian and the "hot". I get back an object that contains all 3 layers merged together.
```js
reg.getConfig({ vegetarian: 'yes', hot: 'very hot' })
.then(function (config) {
  // config is
  // {
  //   bread: 'toasted bread',
  //   main: 'soya burger',
  //   condiment: 'cheese'
  // }
});  
```
This is interesting: the configuration matches 3 layers: the generic one, the vegetarian and the "very hot", but the "main" of the "very hot" layer conflicts with the one in the vegetarian layer. The vegetarian is more prioritary so it win.

## Adding functions
You can add to the registry a function or object. This is treated as a normal layer:
```js
reg.add({
  vegetarian: 'vegan' // conditions
}, {
  condiment: 'lettuce' // layer
});
```
or the equivalent:
```js
reg.add({
  vegetarian: 'vegan'
}, function (conditions) { // obj is the conditions object
  return {
    condiment: 'lettuce'
  };
});
```
The function can also be asynchronous returning a Promise object. THE LIBRARY DOES NOT POLYFILL PROMISES.
```js
reg.add({
  vegetarian: 'vegan'
}, function (conditions) { // obj is the conditions object
  http.get('/random_vegan_condiment')
  .then(function (condiment) {
    return {
      condiment: condiment
    };
  })
});
```

## Use regexp for matching
A layer can contain a condition that matches using a regular expression. In the JSON file is postfixed by "::re", :
```js
reg.add({
  hot: /hot$/
}, {
  condiment: 'jalapeno pepper'
});
```
or:
```js
reg.loadConfig([
  {
    "hot::re": "hot$"
    condiment: 'jalapeno pepper'
  }
]);
```

## Overriding inner properties
A layer can contain properties defining a inner part of the object to override. This uses the lodash/set syntax:
```js
reg.add({
  hot: 'hot'
}, {
  'condiments[0]': 'jalapeno pepper'
});
```
This overrides the first item of the condiments array contained in the previous layer


## Load config from files
The registry can load the layers from one or more JSON files. Given that a single layer is always an object, it assumes that an array is always a list of different layers.
```js
reg.loadConfigFiles(['default.json', 'extra.json']);
```
