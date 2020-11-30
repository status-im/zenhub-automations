const ZenhubAPI = require('zenhub-client'),
      { promisifyAll } = require('bluebird'),
      { INPUT_ZENHUB_API_KEY } = process.env;

if (!INPUT_ZENHUB_API_KEY) {
  throw new Error('"ZENHUB_API_KEY" was not found, please set it in environment secrets.');
}

module.exports = new ZenhubAPI(INPUT_ZENHUB_API_KEY);
