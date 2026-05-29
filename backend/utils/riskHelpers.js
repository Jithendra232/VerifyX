/**
 * Calculate risk level based on risk score
 * @param {number} score - Risk score (0-100)
 * @returns {string} Risk level: LOW, MEDIUM, HIGH, or CRITICAL
 */
const calculateRiskLevel = (score) => {
  const thresholds = getRiskThresholds();
  if (score <= thresholds.lowMax) return "LOW";
  if (score <= thresholds.mediumMax) return "MEDIUM";
  if (score <= thresholds.highMax) return "HIGH";
  return "CRITICAL";
};

const getRiskThresholds = () => ({
  fakeScanMedium: Number(process.env.RISK_FAKE_SCAN_MEDIUM) || 3,
  fakeScanHigh: Number(process.env.RISK_FAKE_SCAN_HIGH) || 5,
  excessiveScanCount: Number(process.env.RISK_EXCESSIVE_SCAN_COUNT) || 20,
  rapidScanCount: Number(process.env.RISK_RAPID_SCAN_COUNT) || 5,
  rapidScanWindowMs:
    (Number(process.env.RISK_RAPID_SCAN_WINDOW_MINUTES) || 5) * 60 * 1000,
  lowMax: Number(process.env.RISK_LOW_MAX) || 25,
  mediumMax: Number(process.env.RISK_MEDIUM_MAX) || 50,
  highMax: Number(process.env.RISK_HIGH_MAX) || 75,
});

/**
 * Cap risk score at maximum 100
 * @param {number} score - Raw risk score
 * @returns {number} Capped risk score
 */
const capRiskScore = (score) => Math.min(score, 100);

/**
 * Remove duplicate reasons from array
 * @param {string[]} reasons - Array of reason strings
 * @returns {string[]} Unique reasons array
 */
const uniqueReasons = (reasons) => [...new Set(reasons)];

module.exports = {
  calculateRiskLevel,
  capRiskScore,
  getRiskThresholds,
  uniqueReasons,
};
