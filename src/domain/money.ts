const centsFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "currency",
});

export function centsToDollars(cents: number) {
  return cents / 100;
}

export function dollarsToCents(dollars: number) {
  return Math.round(dollars * 100);
}

export function formatCents(cents: number) {
  return centsFormatter.format(centsToDollars(cents));
}

export function basisPointsToRate(basisPoints: number) {
  return basisPoints / 10_000;
}

export function formatBasisPoints(basisPoints: number) {
  return `${(basisPoints / 100).toFixed(2).replace(/\.00$/, "")}%`;
}

export function formatRate(rate: number, fractionDigits = 4) {
  return `${(rate * 100).toFixed(fractionDigits)}%`;
}
