// Fire me up!

module.exports = {
	implements: 'models/error',
	inject: [ 'require(util)' ]
};

module.exports.factory = function( util ) {
	
	function ModelsError( type, message ) {
		Error.call( this );
		Error.captureStackTrace(this, this.constructor);
		this.name = this.constructor.name;
		this.message = message;
		this.type = type;
	}
	util.inherits( ModelsError, Error );

	return ModelsError;
};

