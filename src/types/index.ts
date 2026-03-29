export interface Address {
  _id?: string;
  fullName: string;
  mobile: string;
  pincode: string;
  state: string;
  city: string;
  area: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  mobile?: string;
  role?: 'user' | 'admin';
  profile_image?: string;
  addresses?: Address[];
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  inStock: boolean;
  stock: number;
  weight?: string;
  ratings?: number;
  numReviews?: number;
  sku?: string;
}

export interface Review {
  _id: string;
  user: {
    _id?: string;
    name: string;
  };
  rating: number;
  comment?: string;
  likes?: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  expiry: string;
  usageLimit?: number;
  usedCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  product: string | { _id?: string; name: string };
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  pincode: string;
  state: string;
  city: string;
  area: string;
  landmark?: string;
}

export type OrderStatus =
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export interface OrderStatusTimelineItem {
  status: OrderStatus;
  timestamp: string;
  description?: string;
  location?: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: OrderStatus;
  subtotal?: number;
  tax?: number;
  gstRate?: number;
  serviceCharge?: number;
  totalPrice: number;
  shippingPrice?: number;
  couponCode?: string;
  couponDiscount?: number;
  statusTimeline?: OrderStatusTimelineItem[];
  createdAt?: string;
  updatedAt?: string;
}
