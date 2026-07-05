export const roundAverageRating = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value.toFixed(1));
};
