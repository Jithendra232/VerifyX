const fs = require("fs");
const path = require("path");

// #region agent log
const LOG_PATH = path.join(__dirname, "..", "..", ".cursor", "debug-8d4d7d.log");

const agentDebugLog = (location, message, data = {}, hypothesisId = "") => {
  try {
    const line = JSON.stringify({
      sessionId: "8d4d7d",
      location,
      message,
      data,
      hypothesisId,
      timestamp: Date.now(),
      runId: data.runId || "pre-fix",
    });
    fs.appendFileSync(LOG_PATH, `${line}\n`);
  } catch {
    // ignore logging failures
  }
};
// #endregion

module.exports = { agentDebugLog };
