/** GST included in order totals (matches orderService) */
export const GST_RATE = 0.18;

export function computeOrderTotals(subtotal: number, discountAmount: number) {
  const taxable = Math.max(0, subtotal - discountAmount);
  const gst = Math.round(taxable * GST_RATE * 100) / 100;
  const total = Math.round((taxable + gst) * 100) / 100;
  return { taxable, gst, total };
}
