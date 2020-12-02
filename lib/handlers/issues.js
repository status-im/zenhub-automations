const zh                  = require('../zh-client'),
      resolveIssueNumbers = require('../resolve-issue-number'),
      { INPUT_INPROG_COLUMN }   = process.env;

exports.assigned = async function handleAssignedIssue (tools) {
  tools.log.info('Handling assigned issue...');

  const failures = [],
        { payload } = tools.context;

  console.log(payload)

  // Move issue(s) to INPROG_COLUMN
  if (INPUT_INPROG_COLUMN) {
    try {
      tools.log.info(`Moving issue #${issueNo} to in progress...`);

      await zh.issues.moveIssueBetweenPipelines(payload.repository.id, issueNo, {
        pipeline_id: INPUT_INPROG_COLUMN,
        position: 'top'
      });

      tools.log.info(`Moved #${issueNo} to in progress.`);
    } catch (e) {
      failures.push(`Failed to move #${issueNo} to in progress: ${e}`);
    }
  }

  if (failures.length) {
    throw new Error(`Failed to execute some actions: ${failures.map(x => x.message || x).join(', ')}`);
  }
};
