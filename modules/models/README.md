# Module: Models

Module offering simple method to organise models. It will respect relations between models and ensure that they will be respected onto modifications of model data. Additionally it provides schema checking and many different hooks


## Interface

Implementing ```models```: Returns a ready-to-use handle to access all defined models. Allowed methods: ```insert```, ```fetch```, ```update```, ```drop```.

Requires modules ```mongo```, ```hooks```, ```schema``` and ```timestamps```.

Requires NodeJS module ```Bluebird```.

Requires ```model:*```: Object defining model:
``` Javascript
{
	name: String,                               // Name of the model (optional)
	collection: Object,                         // Mongo collection (optional)
	schema: {                                   // Model schema
		Selector: { ... },                  // - cf. schema module
		Selector: {                         // - Foreign key
			foreign: String,            //   + Name of the foreign model
			multi: Boolean,             //   + false: 1-n relation; true: n-m relation
			mandatory: Boolean | Number //   + Relation is mandatory; on multi: minimum amount of keys
		},
		...
	},           
	index: Array,                               // Index definition (optional)
	reject: Array,                              // Array of method names that should be rejected if called
	idGenerator: Function                       // ID generator function (optional)
}
```

