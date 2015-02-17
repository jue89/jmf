# Module: Schema

Module checking objects against a given schema.


## Interface: Schema

Implementing ```schema```: Returns a schema factory with the schema as first argument and the ignoreUndefinedField flag as second. The factory returns a thenable function, that will consume an object and returns a promise. It is resolved if the given objects fits into the schema and it is rejected with a SchemaError on mismatch.
``` Javascript
schemaFactory( {
	Selector: {             // Selector for the field. Nested fields are depacked with '.' delimiter
		mandatory: Boolean,  // Defined field is mandatory
		default: Mixed,      // Default value for defined field
		type: String,        // Type of field. Can be 'string', 'number', 'array', 'date' or extended by pattern modules.
		min: Number,         // For strings: max length. For numbers: max value
		max: Number,         // For strings: min length. For numbers: min value
		pattern: RegExp,     // For strings: pattern that must be matching
	},
	...
} )
```

Requires NodeJS modules  ```Bluebird``` and ```util```.

Require ```schema/pattern:*```: User-defined patterns.
``` Javascript
{
	Name: RegExp,             // Objects with type Name will be checked against the given RegExp
	...
}
```

## Interface: SchemaError

Implementing ```schema/error```: Error class that will be thrown on schema errors.

Requires NodeJS module ```util```.


## Other Interfaces

Implementing ```app/errhandlers:schema```: Handles thrown Schema Errors. Requires JSONAPI driver to be installed.

Implementing ```schema/pattern:certs```, ```schema/pattern:uuid``` and ```schema/pattern:color```.
