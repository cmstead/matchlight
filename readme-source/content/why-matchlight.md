<!--bl
    (filemeta
        (title "Why Matchlight?")
    )
/bl-->

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
