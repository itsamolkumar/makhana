import { IOrder } from "@/models/order.model";

/**
 * Format order number for display
 */
export const formatOrderNumber = (orderId: string): string => {
  return orderId || "N/A";
};

/**
 * Get order status badge color
 */
export const getOrderStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    shipped: "bg-purple-100 text-purple-800",
    out_for_delivery: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    returned: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

/**
 * Get payment status badge color
 */
export const getPaymentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

/**
 * Format date in IST timezone
 */
export const formatDateIST = (date: Date | string | undefined): string => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
};

/**
 * Format currency as INR
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format currency with decimal
 */
export const formatCurrencyDecimal = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get order summary for display
 */
export const getOrderSummary = (order: IOrder): Record<string, any> => {
  return {
    orderNumber: order.orderNumber,
    status: order.orderStatus,
    paymentStatus: order.paymentStatus,
    totalItems: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: formatCurrencyDecimal(order.totalPrice),
    createdAt: formatDateIST(order.createdAt),
    deliveredAt: order.deliveredAt ? formatDateIST(order.deliveredAt) : "Pending",
    estimatedDelivery: order.estimatedDelivery ? formatDateIST(order.estimatedDelivery) : "N/A",
  };
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (order: IOrder): boolean => {
  return !["delivered", "cancelled", "returned"].includes(order.orderStatus);
};

/**
 * Check if order can be returned
 */
export const canReturnOrder = (order: IOrder): boolean => {
  if (order.orderStatus !== "delivered") return false;
  if (!order.deliveredAt) return false;

  // Return window: 30 days
  const daysSinceDelivery = Math.floor((Date.now() - new Date(order.deliveredAt).getTime()) / (24 * 60 * 60 * 1000));
  return daysSinceDelivery <= 30;
};

/**
 * Get remaining return window in days
 */
export const getReturnWindowDays = (order: IOrder): number => {
  if (order.orderStatus !== "delivered" || !order.deliveredAt) return 0;

  const daysSinceDelivery = Math.floor((Date.now() - new Date(order.deliveredAt).getTime()) / (24 * 60 * 60 * 1000));
  const remainingDays = 30 - daysSinceDelivery;
  return Math.max(0, remainingDays);
};

/**
 * Calculate order cost breakdown
 */
export const getOrderBreakdown = (order: IOrder) => {
  return {
    subtotal: formatCurrencyDecimal(order.subtotal),
    tax: formatCurrencyDecimal(order.tax),
    shipping: formatCurrencyDecimal(order.shippingPrice),
    couponDiscount: formatCurrencyDecimal(order.couponDiscount),
    discount: formatCurrencyDecimal(order.discount || 0),
    totalDiscount: formatCurrencyDecimal((order.couponDiscount || 0) + (order.discount || 0)),
    total: formatCurrencyDecimal(order.totalPrice),
  };
};

/**
 * Get order timeline
 */
export const getOrderTimeline = (order: IOrder) => {
  return (order.statusTimeline || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

/**
 * Check if payment is required
 */
export const isPaymentRequired = (order: IOrder): boolean => {
  return order.paymentMethod !== "cod" && order.paymentStatus === "pending";
};

/**
 * Generate order invoice data
 */
export const generateInvoiceData = (order: IOrder) => {
  return {
    orderNumber: order.orderNumber,
    orderDate: formatDateIST(order.createdAt),
    customerName: order.shippingAddress.fullName,
    customerEmail: (order as any).user?.email || "N/A",
    customerPhone: order.shippingAddress.mobile,
    items: order.orderItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: formatCurrencyDecimal(item.price),
      subtotal: formatCurrencyDecimal(item.price * item.quantity),
    })),
    breakdown: getOrderBreakdown(order),
    shippingAddress: `${order.shippingAddress.fullName}, ${order.shippingAddress.area}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
    trackingNumber: order.trackingNumber || "N/A",
    paymentMethod: order.paymentMethod.toUpperCase(),
  };
};

/**
 * Get order by status filter options
 */
export const getOrderStatusOptions = () => [
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

/**
 * Get payment status options
 */
export const getPaymentStatusOptions = () => [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];
