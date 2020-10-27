const secondsToHms = seconds => {
  const days = Math.floor(seconds / 86400);
  const remainderSeconds = seconds % 86400;
  const hms = new Date(remainderSeconds * 1000).toISOString().substring(11, 19);

  return hms.replace(/^(\d+)/, h => `${Number(h) + days * 24}`.padStart(2, '0'));
};

export default secondsToHms;
