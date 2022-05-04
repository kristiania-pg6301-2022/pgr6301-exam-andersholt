export function getHumanDate(timestamp) {
  const humanDate = new Date(parseInt(timestamp)).toLocaleString();
  return humanDate;
}
