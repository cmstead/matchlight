# matchlight #
## A rich pattern matching library to light up your code ##

Sometimes what you need is a conditional, but sometimes what you need is something more powerful.  Pattern matching is less about whether a boolean result exists and more about the shape of the data. Matchlight provides a simple way to produce really powerful code.

## Installation ##

```bash
npm install matchlight --save
```

That's it! You have everything you need.

## Useage ##

Matchlight is exposed as a factory and must be called with Signet.  Signet is installed by default, but matchlight makes the assumption you will want to create your own types and expose them into matchlight from your application. One-time setup should look like this:

```
var matchlight = require('matchlight')(signet);
```

Once matchlight is set up, you can use it like the following:

```
// We can use matchlight to create a clean Fibonacci calculator

function fib (n) {
    return matchlight.match(n, function (matchCase, matchDefault) {
        matchCase(0, () => 1);
        matchCase(1, () => 1);
        matchDefault(() => fib(n-1) + fib(n-2));
    });
}
```

It's also possible to perform more complex operations:

```
// This is an example of deep-checking used to test the library:

const testValue = { 
    test: [1], 
    foo: {
        bar: 'quux'
    }
};

let result = matchlight.match(testValue, function (matchCase, matchDefault, byType) {
    matchCase({ test: 1 }, ({test}) => test);
    matchCase({ test: [byType('int')], foo: { bar: 'quux' } }, ({foo: {bar}}) => bar);
    matchDefault(() => new Error())
});

assert.equal(result, 'quux');

```

Array matching with '...rest' (rest type):

```
var testData = [1, 2, 3, 4, 5];

let result = matchlight.match(testData, function (matchCase, _, byType) {
    matchCase([1, 2, 3, 4], ([x]) => x);
    matchCase([1, 2, 3, byType('...rest')], ([,,, ...rest]) => rest);
});

assert.equal(JSON.stringify(result), '[4,5]');
```

Array matching with '...' (seek type):

```
var testData = [1, 2, 3, 4, 5];

let result = matchlight.match(testData, function (matchCase, _, byType) {
    matchCase([1, 2, byType('...'), 5], ([,,,,x]) => x);
});

assert.equal(result, 5);
```

Matchlight has a matchArguments function. This means you can use matchlight to handle optional arguments, variadic and multivariate functions with ease! You can match on arguments with matchArguments like the following:

```
function add() {
    return matchlight.matchArguments(arguments, function (matchCase, matchDefault, byType) {
        matchCase([byType('number')], ([a]) => b => a + b);
        matchCase([byType('number'), byType('number')], ([a, b]) => a + b);
        matchCase(byType('array<number>'), (values) => values.reduce((sum, value) => sum + value, 0));
        matchDefault(() => { throw new Error('Add can only accept numbers.'); });
    });
}
```

## API ##

Matchlight has a two API endpoints: match and matchArguments. Both of these expose three functions, matchCase, matchDefault and byType which allow the developer to construct rich type mapping and behaviors.  The contracts are as follows:

- match -- `valueUnderTest:*, caseWrapper:function<function, [function], [function] => undefined> => *`
- matchArguments -- `arguments:arguments, caseWrapper:function<function, [function], [function] => undefined> => *`
- matchCase -- `matchValue:*, matchAction:function => undefined`
- matchDefault -- `matchAction:function => undefined`
- byType -- `typeToCheck:type => value:* => boolean`
    - Special type checks
        - '...rest' -- Rest type: checks array values until rest check, allows for any number of tail values
        - '...' -- Seek type: seeks through array until next check passes, fails if no match is found

## Built-in Signet Types ##

- `*`
- `array`
- `boolean`
- `function`
- `null`
- `number`
- `object`
- `string`
- `symbol`
- `undefined`
- `arguments` - `* -> variant<array; object>`
- `bounded<min:number;max:number>` - `* -> number -> bounded`
- `boundedInt<min:number;max:number>` - `* -> number -> int -> bounded -> boundedInt`
- `boundedString<minLength:int;maxLength:int>` - `* -> string -> boundedString`
- `composite` - `* -> composite` (Type constructor only, evaluates left to right)
- `formattedString<regex>` - `* -> string -> formattedString`
- `int` - `* -> number -> int`
- `leftBounded<min:number>` - `* -> number -> leftBounded`
- `leftBoundedInt<min:int>` - `* -> number -> int -> leftBoundedInt`
- `not` - `* -> not` (Type constructor only)
- `regexp` - `* -> object -> regexp`
- `rightBounded<max:number>` - `* -> number -> rightBounded`
- `rightBoundedInt<max:int>` - `* -> number -> int -> rightBoundedInt`
- `tuple<type;type;type...>` - `* -> object -> array -> tuple`
- `unorderedProduct<type;type;type...>` - `* -> object -> array -> unorderedProduct`
- `variant<type;type;type...>` - `* -> variant`

## Change Log ##

### 1.0.0 ###

Initial release
