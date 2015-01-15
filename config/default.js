// Fire me up!

module.exports = {
	implements: 'config:default',
	inject: [ 'require(fs)' ]
}

module.exports.factory = function( fs ) { return {
	app: {
		user: null,
		group: null
	},
	https: {
		port: 8000,
		key: fs.readFileSync('./server.key'),
		cert: fs.readFileSync('./server.crt'),
		ca: fs.readFileSync('./cacert.pem')
	},
	db: {
		client: 'sqlite3',
		connection: { filename: 'data.db' },
		debug: true
	}
} }
