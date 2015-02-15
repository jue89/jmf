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
