/**
 * Calculate risk level based on risk score
 * @param {number} score - Risk score (0-100)
 * @returns {string} Risk level: LOW, MEDIUM, HIGH, or CRITICAL
 */
const calculateRiskLevel = (score) => {
  if (score <= 25) return "LOW";
  if (score <= 50) return "MEDIUM";
  if (score <= 75) return "HIGH";
  return "CRITICAL";
};

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
  uniqueReasons,
};
