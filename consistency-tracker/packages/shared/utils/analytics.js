function getContributionIntensity(totalSeconds, targetSeconds = 0) {
  if (!totalSeconds) {
    return 0;
  }

  if (!targetSeconds) {
    if (totalSeconds >= 4 * 3600) return 4;
    if (totalSeconds >= 2 * 3600) return 3;
    if (totalSeconds >= 3600) return 2;
    return 1;
  }

  const ratio = totalSeconds / targetSeconds;
  if (ratio >= 1.5) return 4;
  if (ratio >= 1) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}

function getConsistencyPercentage(activeDays, totalDays) {
  if (!totalDays) {
    return 0;
  }

  return Math.round((activeDays / totalDays) * 100);
}

function sumSeconds(records = []) {
  return records.reduce((total, item) => total + Number(item.durationSeconds || 0), 0);
}

module.exports = {
  getContributionIntensity,
  getConsistencyPercentage,
  sumSeconds,
};