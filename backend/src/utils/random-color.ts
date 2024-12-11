export const getRandomColor = () => {
  const colors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#4BC0C0',
    '#FFCD56',
    '#36A2EB',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};