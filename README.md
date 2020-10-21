
<!-- GENERATED DOCUMENT! DO NOT EDIT! -->
# Matchlight #
#### Pattern matching -- conditional logic for humans ####

[v1 docs can be found here](https://github.com/cmstead/matchlight/tree/v1.2.8)


## Table Of Contents ##

- [Section 1: Why Matchlight?](#user-content-why-matchlight?)
- [Section 2: Installation](#user-content-installation)
- [Section 3: Setting Up Matchlight](#user-content-setting-up-matchlight)
- [Section 4: Examples](#user-content-examples)
- [Section 5: Matchlight API](#user-content-matchlight-api)

## Why Matchlight? ##

JavaScript has a number of useful conditional structures, including if/else structres, switches, and ternary expressions. Functional programming languages have another construct that adds extra power to conditional behaviors -- pattern matching. Matchlight is a pattern matching library for JavaScript that allows the programmer to match conditions based on the shape of data instead of imperative conditional construction.

Why pattern matching?

When conditions are simple, the standard JavaScript conditional behaviors are completely acceptable. Conditionals, however, tend to get muddy and confusing when they start describing the shape of the data that should be acceptable.

Imagine if you could simply outline the data and your conditional would do the work of properly comparing the shape to your outline. Perhaps you create a conditional that looks like this:

```javascript
if (
    typeof dataBlob?.givenName === "string" &&
    typeof dataBlob?.familyName === "string" &&
    typeof dataBlob?.phoneNumber?.locale === "string" &&
    typeof dataBlob?.address?.postalCode === "string"
) {
    // do something
} else {
    throw new Error("Missing data blob information");
}
```

What if, instead, you could do something like this:

```javascript
match(dataBlob, function (on, onDefault) {
    const expectedDataShape = {
        givenName: STRING,
        familyName: STRING,
        phoneNumber: { locale: STRING },
        address: { postalCode: STRING }
    };

    on(expecteDataShape, (dataBlob) => { /* doSomething */ });
    onDefault(() => { throw new Error("Missing data blob information"); });
});
```

This is the power that pattern matching offers. You can simply describe the data as it should be, instead of having to laboriously reference each property and sub property, generating a long list of `&&` concatenated boolean expressions. Matchlight lets you write conditions the way people think.

It's conditional matching for humans.

    

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
    return match(n, function(onCase, onDefault) {
        onCase(0, () => 1);
        onCase(1, () => 1);
        onDefault(x => fibonacci(x-1) + fibonacci(x - 2));
    });
}
```

Pattern matching using types:

```javascript
const { match, types: { NUMBER, STRING } } = require('matchlight');

// parseFloat does this all, already, but it's a handy example
function numberifyFloat(x){
    return match(x, function(onCase, onDefault){
        onCase(NUMBER, x => x);
        onCase(STRING, x => parseFloat(x));
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
    return match(x, function(onCase, onDefault){
        onCase([NUMBER, , , [NUMBER]], ([x, , , [y]]) => x * y);
        onDefault(() => 0);
    });
}
```

Get last value from an array (of any length) if it's a number:

```javascript
const { match, types: { NUMBER, STRING } } = require('matchlight');

const last = values => values[values.length - 1];

function getLastNumberOrDefault(values, defaultNumber = 0) {
    return match(values, function(onCase, onDefault) {
        onCase([matcher('...'), NUMBER], (values) => last(values));
        onDefault(() => defaultNumber);
    });
}
```

Regular expressions:

```javascript
function getValidationMessage(phoneNumber) {
    return match(phoneNumber, function(onCase, onDefault){
        onCase(/\([0-9]{3}\) [0-9]{3}-[0-9]{4}/,
            () => 'Phone number is an acceptable US format');
        onDefault(() => 'Phone number did not match any expected format');
    });
}
```

User defined functions:

```javascript
function getNumberType(value) {
    return match(value, function(onCase, onDefault) {
        onCase(value => !NUMBER(value), () => 'nan');
        onCase(value => Math.abs(value) === Infinity, () => 'infinity');
        onCase(value => Math.floor(value) === value, () => 'int');
        onDefault(() => 'float');
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
    