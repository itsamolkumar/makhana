import Cart from "@/models/cart.model";
import Coupon from "@/models/coupon.model";

export async function calculateCheckout(userId: string, code?: string) {

  const cart = await Cart

    .findOne({ user: userId })

    .populate("items.product");

  if (!cart || cart.items.length === 0) {

    throw new Error("Cart is empty");

  }


  let subtotal = 0;


  cart.items.forEach((item: any) => {

    subtotal += item.product.price * item.quantity;

  });


  let discount = 0;

  let appliedCoupon = null;


  if (code) {

    const coupon = await Coupon.findOne({

      code: code.toUpperCase(),

      isActive: true

    });


    if (!coupon) {

      throw new Error("Invalid coupon");

    }


    if (coupon.expiry < new Date()) {

      throw new Error("Coupon expired");

    }


    if (subtotal < coupon.minOrder) {

      throw new Error(

        `Minimum order ₹${coupon.minOrder} required`

      );

    }


    if (coupon.discountType === "percentage") {

      discount = (subtotal * coupon.discountValue) / 100;

      if (coupon.maxDiscount) {

        discount = Math.min(discount, coupon.maxDiscount);

      }

    }

    else {

      discount = coupon.discountValue;

    }


    appliedCoupon = coupon.code;

  }


  const finalPrice = subtotal - discount;


  return {

    subtotal,

    discount,

    finalPrice,

    coupon: appliedCoupon

  };

}