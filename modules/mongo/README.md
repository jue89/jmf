# Module: MongoDB

Module offering database access using MongoDB


## Interface

Implementing ```mongo```: Returns handle to started Mongodb instance.

Requires NodeJS module ```mongodb-promises```.

Requires ```config```: Object with pattern:
``` Javascript
{
	mongodb: {
		host: Array,      // Array of hosts to connect to
		db: String        // Name of datavase
	}
}
```

