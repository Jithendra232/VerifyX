// #region agent log
const AGENT_DEBUG_ENDPOINT =
  "http://127.0.0.1:7423/ingest/545b2669-d66a-4e34-94da-5f3459a478e7";

export const agentDebugLog = (location, message, data = {}, hypothesisId = "") => {
  fetch(AGENT_DEBUG_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8d4d7d",
    },
    body: JSON.stringify({
      sessionId: "8d4d7d",
      location,
      message,
      data,
      hypothesisId,
      timestamp: Date.now(),
      runId: data.runId || "post-fix",
    }),
  }).catch(() => {});
};
// #endregion
