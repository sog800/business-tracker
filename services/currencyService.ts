export function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case "MWK":
      return "MK";
    case "USD":
      return "$";
    default:
      return "$";
  }
}

export function getDefaultCurrency(): string {
  return "USD";
}
