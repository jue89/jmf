// Fire me up!

module.exports = {
	implements: 'app/routes:models',
	inject: [ 'models' ],
};

module.exports.factory = function( models ) {

	// Parse filter objects to selectors
	function parseFilter( filter, schema ) {
		var and = [];

		// Iterate through all filters
		for( var f in filter ) {

			// Get type of current field
			var type = schema[ f ] ? schema[ f ].type : null;

			// Split string and execute for each value
			filter[f].split( ',' ).forEach( function( v ) {

				// Detect operators
				var operator, value;
				if( v[0] == '<' ) {
					value = v.substr( 1 );
					operator = '$lt';
				} else if( v[0] == '>' ) {
					value = v.substr( 1 );
					operator = '$gt';
				} else if( v[0] == '!' ) {
					value = v.substr( 1 );
					operator = '$ne';
				} else {
					value = v;
					operator = false;
				}

				// Parse value
				if( type == 'date' ) {
					value = new Date( value );
				} else if( type == 'number' ) {
					value = parseInt( value );
				} else if( type == 'boolean' ) {
					if( value == 'true' ||
					    value == '1' ||
					    value == 'chucknorris' ) {
						value = true;
					} else {
						value = false;
					}
				} else if( type == 'array' ) {
					operator = '$in';
					value = [ value ];
				}

				// Create query string and append to and array
				var match;
				if( operator ) {
					match = {};
					match[ operator ] = value;
				} else {
					match = value;
				}
				var tmp = {};
				tmp[ f ] = match;
				and.push( tmp );

			} );

		}

		return { '$and': and };
	}

	function gatherReqInfo( req ) {
		var info = {};

		// If client certificate has been use, append this information
		info.cert = req.connection.getPeerCertificate();

		// IP address of the user; TODO: Reverse proxies?
		info.ip = req.ip;

		// Add request headers
		info.headers = req.headers;

		// Add query
		info.query = req.query;

		return info;
	}

	return { priority: 0, register: function( app ) { models._index.forEach( function( m ) {

		// Current base path
		var base = '/' + m;
		var model = models[m];

		// Get list of model
		app.get( base, function( req, res, next ) {

			// Build query:
			var q = req.query;
			var query = {};

			// - Limit
			query.limit = q.limit ? parseInt( q.limit ) : 50;
			if( isNaN( query.limit ) ) query.limit = 0;

			// - Page
			query.page = q.page ? parseInt( q.page ) : 0;
			if( isNaN( query.page ) ) query.page = 0;

			// - Fields
			query.fields = {};
			if( q.fields && typeof q.fields == 'string' ) {
				query.fields[m] = q.fields.split( ',' );
			} else if( q.fields && typeof q.fields == 'object' ) {
				for( var f in q.fields ) {
					query.fields[f] = q.fields[f].split( ',' );
				}
			}

			// - Filter
			if( q.filter && typeof q.filter == 'object' ) {
				query.selector = parseFilter( q.filter, model.schema );
			}

			// - Includes
			if( q.include ) query.include = q.include.split( ',' );


			// Fetch from model
			model.fetch( {
				httpReq: gatherReqInfo( req ),
				req: query
			} ).then( function( query ) {
				res.endJSON( query.res );
			} ).catch( next );

		} );

		// Get list of model
		app.get( base + '/:id', function( req, res, next ) {

			// Build query:
			var q = req.query;
			var query = {};

			// - Filter
			query.selector = { _id: req.params.id };

			// - Fields
			query.fields = {};
			if( q.fields && typeof q.fields == 'string' ) {
				query.fields[m] = q.fields.split( ',' );
			} else if( q.fields && typeof q.fields == 'object' ) {
				for( var f in q.fields ) {
					query.fields[f] = q.fields[f].split( ',' );
				}
			}

			// - Includes
			if( q.include ) query.include = q.include.split( ',' );


			// Fetch item
			model.fetch( {
				httpReq: gatherReqInfo( req ),
				req: query
			} ).then( function( query ) {
				if( query.res.meta.count != 1 ) {
					res.endJSONapiError(
						404,
						'not-found',
						"The requested item does not exist."
					);
				} else {
					var obj = {};
					obj[ m ] = query.res[ m ][ 0 ];
					obj.links = query.res.links;
					obj.linked = query.res.linked;
					res.endJSON( obj );
				}
			} ).catch( next );

		} );

		// Create new item
		app.post( base, function( req, res, next ) {

			// Insert into model
			model.insert( {
				httpReq: gatherReqInfo( req ),
				req: req.body[m] || {}
			} ).then( function( query ) {
				res.endJSON( query.res );
			} ).catch( next );

		} );

		// Update item
		app.put( base + '/:id', function( req, res, next ) {

			// Build query:
			var q = req.query;
			var query = {};

			// - Filter
			query.selector = { _id: req.params.id };

			// - Modifier
			query.modifier = { $set: req.body[m] || {} };


			// Update item
			model.update( {
				httpReq: gatherReqInfo( req ),
				req: query
			} ).then( function( query ) {
				var tmp = {};
				tmp[ m ] = query.res;
				res.endJSON( tmp );
			} ).catch( next );

		} );

		// Get list of model
		app.delete( base + '/:id', function( req, res, next ) {

			// Build query:
			var q = req.query;
			var query = {};

			// - Filter
			query.selector = { _id: req.params.id };


			// Fetch item
			model.drop( {
				httpReq: gatherReqInfo( req ),
				req: query
			} ).then( function( query ) {
				if( query.res.length != 1 ) {
					res.endJSONapiError(
						404,
						'not-found',
						"The requested item does not exist."
					);
				} else {
					res.status( 200 ).end();
				}
			} ).catch( next );

		} );

	} ); } };

};
