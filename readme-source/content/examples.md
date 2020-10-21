<!--bl
    (filemeta
        (title "Examples")
    )
/bl-->

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
