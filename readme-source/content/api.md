<!--bl
    (filemeta
        (title "Matchlight API")
    )
/bl-->

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
