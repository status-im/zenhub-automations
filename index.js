const { Toolkit } = require('actions-toolkit'),
      { join } = require('path');

const tools = new Toolkit();

const handlers = {
  create: 'create.js',
  ready_for_review: 'create.js',
  pull_request: 'pull_request.js'
}

Toolkit.run(async tools => {
  const handlerRef = tools.context.event;

  tools.log.info(`Trying to load handler: "${handlerRef}"...`);

  try {
    const file = handlers[handlerRef];
    if (!file) {
     tools.log.info(`Could not find handler for "${handlerRef}"`);
     return
    }

    var eventModule = require(`./lib/handlers/${file}`);
  } catch (e) {
    console.log(e)
    return tools.exit.success('Failed to load module for event. No action necessary.');
  }

  const moduleAction = eventModule[tools.context.payload.action] || eventModule[tools.context.payload.ref_type];

  console.log(tools.context.payload);

  if (!moduleAction) {
    return tools.exit.success('Failed to find sub handler. No action necessary.');
  }

  try {
    await moduleAction(tools);
  } catch (e) {
    return tools.exit.failure(`Failed to run event handler: ${e}`);
  }

  tools.exit.success('Executed event handler.');
});
