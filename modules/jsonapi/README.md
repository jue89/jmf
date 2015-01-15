# Module: JSONAPI

Module extending the Express app with [JSONAPI](http://jsonapi.org) drivers


## Offered function

res.endJSON( obj ): Returns obj in JSON format.

res.endJSONapiError( status, id, message ): Throws an JSONAPI error.

res.endJSONapiList( obj ): Displays the obj in the format of JSONAPI. Can be an array (unpaged list) or:
``` JSONAPI
{
	page: Number,    // Current page
	limit: Number,   // Objects per Page
	count: Number,   // Total number of objects
	data: Array      // Array with data of the current page
}
```

res.endJSONapiItem( obj ): Obj is an array with length 1. Otherwise error 404 is delivered.

res.endJSONapiCheck( obj ): If obj is true 202 is delivered. Otherwise 404.
