# Module: MongoDB

Module offering database access using MongoDB. It offers an abstraction layer for using the callback-based mongodb backend with a promise-based application. The interfaces are designed for work well in then chains.


## Interface

Implementing ```mongo```: Returns handle to started MongoDB instance offering ```collection``` function. Upon execution with name of the desired collection it will return an object offering methods for collection manipulation:

 * ```index( fields, option )```: Ensures the given index. Fields is an array of fieldnames the index is based on. 
 * ```insert( docs )```: Inserts given docs into collection
 * ```fetch( query )```: Query is an object with fields: ```selector```, ```limit```, ```page```, ```sort```,  ```fields```. 
 * ```update( query )```: Query is an object with fields: ```selector```, ```modifier```. 
 * ```drop( query )```: Query is an object with fields: ```selector```. 

Implementing ```mongo/objectid```: Returns thenable function to add an ObjectID to a document.

Requires module ```schema```.

Requires NodeJS module ```mongodb```.

Requires ```config```: Object with pattern:
``` Javascript
{
	mongodb: {
		server: Array,    // Array of hosts to connect to (ReplSet cluster)
		db: String        // Name of datavase
	}
}
```

