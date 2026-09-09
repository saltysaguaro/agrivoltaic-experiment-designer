export function normalizeMonth(month) {
    const rounded = Math.trunc(month);
    if (rounded < 1 || rounded > 12) {
        throw new Error(`Month must be between 1 and 12, received ${month}`);
    }
    return rounded;
}
export function expandMonthRange(startMonth, endMonth) {
    const start = normalizeMonth(startMonth);
    const end = normalizeMonth(endMonth);
    if (start <= end) {
        return Array.from({ length: (end - start) + 1 }, (_, index) => start + index);
    }
    return [
        ...Array.from({ length: 13 - start }, (_, index) => start + index),
        ...Array.from({ length: end }, (_, index) => index + 1),
    ];
}
export function sumSelectedMonths(values, months) {
    return months.reduce((sum, month) => sum + (values[month - 1] ?? 0), 0);
}
