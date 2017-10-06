'use strict';

// Load modules

const Path = require('path');
const Brule = require('brule');
const Hapi = require('hapi');
const Inert = require('inert');
const WebStream = require('./webStream');


const internals = {};


function main () {
  const serverConfig = {
    connections: {
      routes: {
        files: {
          relativeTo: Path.join(__dirname, 'public')
        }
      }
    }
  };

  const server = new Hapi.Server(serverConfig);
  server.connection({ port: process.env.PORT || 80 });
  server.register([Inert, Brule], () => {
    server.route([{
      method: 'GET',
      path: '/{param*}',
      handler: {
        directory: {
          path: '.',
          redirectToSlash: true,
          index: true
        }
      }
    },
    {
      method: 'POST',
      path: '/api/humidity',
      handler: reading
    },
    {
      method: 'POST',
      path: '/api/temperature',
      handler: reading
    }
  ]);

    server.start(() => {
      console.log(`listening at http://localhost:${server.info.port}`);
      internals.webstream = WebStream(server.listener);
    });
  });
}
main();

function reading (request, reply) {
  internals.webstream.emit(request.payload);
  reply('');
}
