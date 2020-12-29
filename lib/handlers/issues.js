const zh = require("../zh-client"),
  resolveIssueNumbers = require("../resolve-issue-number"),
  { INPUT_REVIEW_COLUMN, INPUT_INPROG_COLUMN, INPUT_NEXT_COLUMN } = process.env;

exports.milestoned = async function handleMilestonedIssue(tools) {
  tools.log.info("Handling assigned issue...");

  const failures = [],
    { payload } = tools.context;

  const issueNo = payload.issue.number;
  let zenHubIssue = await zh.issues.getIssueData(payload.repository.id, issueNo);
  if (!zenHubIssue) {
    tools.log.info("issue not found");
    return;
  }
  if (
    zenHubIssue.pipeline.pipeline_id == INPUT_INPROG_COLUMN ||
    zenHubIssue.pipeline.pipeline_id == INPUT_REVIEW_COLUMN
  ) {
    tools.log.info("issue already in progress or in review");
    return;
  }
  // Move it to the NEXT column
  try {
    tools.log.info(`Moving issue #${issueNo} to in progress...`);

    await zh.issues.moveIssueBetweenPipelines(payload.repository.id, issueNo, {
      pipeline_id: NEXT_INPROG_COLUMN,
      position: "top",
    });

    tools.log.info(`Moved #${issueNo} to in progress.`);
  } catch (e) {
    failures.push(`Failed to move #${issueNo} to in progress: ${e}`);
  }
};

exports.assigned = async function handleAssignedIssue(tools) {
  tools.log.info("Handling assigned issue...");

  const failures = [],
    { payload } = tools.context;

  const issueNo = payload.issue.number;

  // Move issue(s) to INPROG_COLUMN
  if (INPUT_INPROG_COLUMN) {
    try {
      tools.log.info(`Moving issue #${issueNo} to in progress...`);

      await zh.issues.moveIssueBetweenPipelines(
        payload.repository.id,
        issueNo,
        {
          pipeline_id: INPUT_INPROG_COLUMN,
          position: "top",
        }
      );

      tools.log.info(`Moved #${issueNo} to in progress.`);
    } catch (e) {
      failures.push(`Failed to move #${issueNo} to in progress: ${e}`);
    }
  }

  if (failures.length) {
    throw new Error(
      `Failed to execute some actions: ${failures
        .map((x) => x.message || x)
        .join(", ")}`
    );
  }
};
