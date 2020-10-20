<!--bl
    (filemeta
        (title "Setting Up Matchlight")
    )
/bl-->

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
