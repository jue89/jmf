// Fire me up!

module.exports = {
	implements: 'httpd/routes:discovery',
	inject: [ 'models', 'config' ],
};

module.exports.factory = function( models, config ) {

	// If no discovery is enabled, just skip
	if( ! config.discovery ) return;

	return { priority: 0, register: function( app ) {

		// Generate list of all models that are not hidden
		var modelsList = [];
		models._index.forEach( function( m ) {
			if( ! models[m].hidden ) modelsList.push( m );
		} );

		// Register GET route
		app.get( '/_discover', function( req, res, next ) {
			res.endJSON( { models: modelsList } );
		} );

	} };

};
