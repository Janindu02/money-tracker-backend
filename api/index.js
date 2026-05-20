const { createApp } = require('../dist/src/server');

let server;

module.exports = async function handler(req, res) {
  if (!server) {
    server = await createApp();
  }
  return server(req, res);
};
