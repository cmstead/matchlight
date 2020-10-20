
<!-- GENERATED DOCUMENT! DO NOT EDIT! -->
# Matchlight #
#### Rich, simple pattern matching for JavaScript ####


## Table Of Contents ##

- [Section 1: Installation](#user-content-installation)
- [Section 2: Setting Up Matchlight](#user-content-setting-up-matchlight)
- [Section 3: Examples](#user-content-examples)
- [Section 4: Matchlight API](#user-content-matchlight-api)

## Installation ##

Matchlight works with Node.js and web projects. Nevertheless, it is recommended that you
use npm to install Matchlight in your project so you can easily keep it up to date. Make sure you have Node.js installed on your computer and, from your project file, run the following:

`npm i matchlight`

If you want to download Matchlight by hand, you can do so from the main repo:

[https://github.com/cmstead/matchlight](https://github.com/cmstead/matchlight)

    

## Setting Up Matchlight ##

For web projects, Matchlight has a minified web build available in matchlight/dist/. You can either copy it manually to your project folder, or you can add it to your build pipeline. That choice is yours to make and understand.

To use Matchlight in the browser, simply include it in your page like so:

`<script src="path/to/matchlight/matchlight.js"></script>`

To use Matchlight in your node application, you can require it this way:

```javascript
const { match, matcher } = require('matchlight');
```

There are other tools and helpers with Matchlight. They can be destructured during require in the same way:

```javascript
const { match, matchArguments, matcher, types } = require('matchlight');
```

    

## Examples ##

Instead of an exhaustive listing of the Matchlight API, let's take a look at how to use Matchlight through some examples.

Simple pattern matching with values and a default:

```javascript
function fibonacci(n) {
    return match(n, function(on, onDefault) {
        on(0, () => 1);
        on(1, () => 1);
        onDefault(x => fibonacci(x-1) + fibonacci(x - 2));
    });
}
```

Pattern matching using types:

```javascript
const { match, types: { NUMBER, STRING } } = require('matchlight');

// parseFloat does this all, already, but it's a handy example
function numberifyFloat(x){
    return match(x, function(on, onDefault){
        on(NUMBER, x => x);
        on(STRING, x => parseFloat(x));
        onDefault(() => NaN);
    });
}
```

Where the real power starts to shine...

Match on data shape:

```javascript
/*
In this example, the array must be exactly 4 elements long
with a single number in an array as the final element
*/

function multiplyOnMatch(values) {
    return match(x, function(on, onDefault){
        on([NUMBER, , , [NUMBER]], ([x, , , [y]]) => x * y);
        onDefault(() => 0);
    });
}
```

Get last value from an array (of any length) if it's a number:

```javascript
const { match, types: { NUMBER, STRING } } = require('matchlight');

const last = values => values[values.length - 1];

function getLastNumberOrDefault(values, defaultNumber = 0) {
    return match(values, function(on, onDefault) {
        on([matcher('...'), NUMBER], (values) => last(values));
        onDefault(() => defaultNumber);
    });
}
```

User defined predicate functions:

```javascript
function getValidationMessage(phoneNumber) {
    return match(phoneNumber, function(on, onDefault){
        on(value => (/\([0-9]{3}\) [0-9]{3}-[0-9]{4}/).test(value),
            () => 'Phone number is an acceptable US format');
        onDefault(() => 'Phone number did not match any expected format');
    });
}
```

    

## Matchlight API ##

Matchlight has a relatively small API footprint. This list will be significantly less useful than the provided examples for learning how to use Matchlight. Instead consider this a reference to generate questions.

### Functions and Properties ###

- `match`
    - Starts a new match expression
    - Accepts a value to match on, and a function in which to create cases statements
- `matchArguments`
    - Matches on function arguments, specifically to support the `arguments` keyword
    - Treats arguments as an array -- otherwise behaves identically to `match`
- `matcher`
    - Provides access to visually semantic matchers like `...` and `...rest`
- `types`
    - An object containing all type definitions supported by Matchlight

### Matchers ###

Matchers are special matching behaviors which allow the user to skip, or capture elements from an array.

- `...`
    - Seek matcher -- skips all values until next defined matching sequence is found
- `...rest`
    - Rest matcher -- acts as a capture matcher for all remaining elements in an array
    - This will skip matching any elements AFTER the rest matcher. To skip some elements, use the seek matcher

### Types ###

Matchlight supports all of the standard JavaScript types, plus an `ANY` type which will accept any value. All types are available on the `type` property. (see functions and properties API reference) The list is as follows:

- `ANY`
- `ARRAY`
- `BIGINT`
- `BOOLEAN`
- `FUNCTION`
- `NULL`
- `NUMBER`
- `OBJECT`
- `STRING`
- `SYMBOL`
- `UNDEFINED`

    


<!-- GENERATED DOCUMENT! DO NOT EDIT! -->
    