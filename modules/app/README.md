# Module: App

Module starting an HTTPS server and installing given driver, routes and error handlers.


## Interface

Implementing ```app```: Returns handle to started HTTPS server.

Requires NodeJS modules  ```Bluebird``` ```Express``` ```Posix```

Requires ```config```: Object with pattern:
``` Javascript
{
	app: {
		user: String,             // Dropping privledges to this user
		group: String             // Dropping privledges to this group
	},
	https: {
		port: Number,             // Port number to listen on
		ca: Buffer,               // Buffer containing CA certificate
		key: Buffer,              // Buffer containing server key
		cert: Buffer              // Buffer containing server certificate
	}
}
```

Requires ```app/drivers:*``` ```app/routes:*``` ```app/errhandlers:*```: Object with pattern:
``` Javascript
{
	priority: Number,                 // Priority for ordering modules
	register: Function( expressApp )  // Register the module. Express instance is exposed.
}
```
 * Drivers: Provide additional functionalities
 * Routes: Configure routes
 * ErrHandlers: Handles global errors thrown by routes
