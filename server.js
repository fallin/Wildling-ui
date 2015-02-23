var Hapi = require('hapi');
var Good = require('good');
var path = require('path');

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 8000
});

server.views({
    engines: {
        jade: require('jade')
    },
    path: path.join(__dirname, 'views')
});

// Add the route
server.route({
    method: 'GET',
    path: '/', 
    handler: function (request, reply) {
       reply.view('index', {title: 'Wildling'});
    }
});

// Serve static content
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            listing: true
        }
    }
});

server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
            args: [{ log: '*', response: '*'} ]
        }]
    }
}, function (err) {
    if (err) {
        throw err;
    }
    
    // Start the server
    server.start(function () {
        console.log('Server running at:', server.info.uri);
    });
});