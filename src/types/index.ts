export interface User {
  id: string;
  email: string;
  name: string;
  mobile?: string;
  role?: 'user' | 'admin';
  profile_image?: string;
}

export interface Product {
  _id: string;
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

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalPrice: number;
  shippingPrice?: number;
  couponCode?: string;
  couponDiscount?: number;
  createdAt?: string;
  updatedAt?: string;
}
