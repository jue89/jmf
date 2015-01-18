var fs = require( 'fs' );

module.exports = {
	ca: fs.readFileSync( __dirname + '/test_ca.crt' ),
	server_key: fs.readFileSync( __dirname + '/test_server.key' ),
	server_cert: fs.readFileSync( __dirname + '/test_server.crt' ),
	client_pfx: fs.readFileSync( __dirname + '/test_client.pfx' ),
	client_pfx_password: '1234567890'
}
