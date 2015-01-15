// Fire me up!

module.exports = {
	implements: 'schema/error',
	inject: [ 'require(util)' ]
}

module.exports.factory = function( util ) {

	// Error object for all schema-related errors
	function SchemaError( type, message ) {
		Error.call( this );
		Error.captureStackTrace(this, this.constructor);
		this.name = this.constructor.name;
		this.message = message;
		this.type = type;
	}
	util.inherits( SchemaError, Error );

	return SchemaError;

}
