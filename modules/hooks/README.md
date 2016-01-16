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

**Using the chain helper directly:**

``` Javascript
module.exports = {
	implements: 'barfoo',
	inject: [ 'chain' ]
}

module.exports.factory = function( chain ) {
	var funcs = [ {
		action: function( elem ) {
			elem.field += 1;
			return elem;  // the function returns the item, so the next can reuse it
		}
		// this function has no priority and gets default priority 0
	}, {
		action: function( elem ) {
			action.field = 0;
			return elem;
		},
		priority: 1  // this function should be executed before the first one, since
		             // it has a higher priority
	} ];

	var c = chain( funcs );

	// execute the chain
	c( { field: 42 } ).then( function ( elem ) {
		console.log( elem.field ); // prints "1" on the console
	} );
}
```
