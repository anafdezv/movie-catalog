export const calculateAverageRating = (values: number[]) => {
  if (values.length === 0) {
    return null;
  }

  const average = values.reduce((total, value) => total + value, 0) / values.length;
  return Number(average.toFixed(1));
};

