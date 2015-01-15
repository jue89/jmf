# Module: DB

Module offering database access using Knex.js


## Interface

Implementing ```db```: Returns handle to started Knex instance.

Requires NodeJS modules  ```Bluebird``` ```Knex```.

Requires ```config```: Object with pattern:
``` Javascript
{
	db: {
		client: String,           // Client for database backend
		connection: Object        // Cleint-specific options
	}
}
```

Requires ```db/schema:*```:
``` Javascript
[ {
	tableName: String,                // Name of table
	register: Function( schema )      // Function executed if table does not exists. Schema builder is exposed.
}, {
	...                               // Another table
} ]
```
