export const currency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const shortDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));

export const monthKey = (date = new Date()) =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;

export const todayKey = (date = new Date()) =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;

export const monthLabel = (value) => {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
};

export const shiftMonth = (value, delta) => {
  const [year, month] = value.split("-").map(Number);
  return monthKey(new Date(year, month - 1 + delta, 1));
};

export const buildCalendarGrid = (month) => {
  const [year, monthIndex] = month.split("-").map(Number);
  const firstDay = new Date(year, monthIndex - 1, 1);
  const daysInMonth = new Date(year, monthIndex, 0).getDate();
  const offset = firstDay.getDay();
  const grid = [];

  for (let i = 0; i < offset; i += 1) {
    grid.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    grid.push(`${year}-${`${monthIndex}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`);
  }

  while (grid.length % 7 !== 0) {
    grid.push(null);
  }

  return grid;
};

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const emitDataRefresh = () => {
  window.dispatchEvent(new CustomEvent("fintrack:data-updated"));
};
