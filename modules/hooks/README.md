# Module: Hooks

Helper module to work with injected hooks.


## Interface

Implementing ```hooks(namespace,action1 action2 ...)```: Returns an array with all required (thenable) actions grouping all injected hooks.

Requires NodeJS modules ```Bluebird```.

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
