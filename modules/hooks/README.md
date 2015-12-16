# Module: Hooks

Helper module to work with injected hooks.


## Interface

Implementing ```hooks```: Returns function with parameters namespace and array of actions. It returns an array with all required (thenable) actions grouping all injected hooks.

Requires NodeJS module ```Bluebird```.

Requires ```hook:*```: Object with pattern:
``` Javascript
{
	namespace: {
		action: {
			priority: Number,        // Priority of the hook (high to low)
			action: Function( obj )  // Action called. Can return a promise. Must return/resolve obj.
		},
		...
	},
	...
}
```

## Examples

**Calling hooks:**

``` Javascript
module.exports = {
	implements: 'foobar',
	inject: [ 'hooks' ]
};

module.exports.factory = function( getHooks ) {

	// receive the actions 'pre' and 'post' for the 'global'-module
	var globalHooks = getHooks('global', ['pre', 'post']);

	// calling the hook chain (look: it's a promise)
	globalHooks.pre(args).then( function ( args ) {
		// the hooks are passed and the modified args are passed in here
	} );
}
```
