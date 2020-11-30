const zh                  = require('../zh-client'),
      resolveIssueNumbers = require('../resolve-issue-number'),
      {
        INPUT_REVIEW_COLUMN
      } = process.env;

async function handleOpenedPR (tools) {
  tools.log.info('Handling opened PR...');

  const failures = [],
        { payload } = tools.context;

  // Move PR closes to REVIEW_COLUMN
  if (INPUT_REVIEW_COLUMN) {
    let issueNumbers = resolveIssueNumbers(payload.pull_request.head.ref, payload.pull_request.body);

    for (let i = 0; i < issueNumbers.length; i++) {
      let issueNo = issueNumbers[i];

      try {
        await zh.issues.moveIssueBetweenPipelines(payload.repository.id, issueNo, {
          pipeline_id: INPUT_REVIEW_COLUMN,
          position: 'top'
        });
      } catch (e) {
        failures.push(`Failed to move issue ${issueNo}: ${e}`);
      }
    }
  }

  if (failures.length) {
    throw new Error(`Failed to execute some actions: ${failures.map(x => x.message || x).join(', ')}`);
  }
};

exports.opened = handleOpenedPR;
exports.ready_for_review = handleOpenedPR;
