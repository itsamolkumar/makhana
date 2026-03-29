import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { adminMiddleware } from "@/middleware/admin.middleware";
import { apiSuccess, apiError } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

// Models
import User from "@/models/user.model";
import Order from "@/models/order.model";
import Product from "@/models/product.model";
import Coupon from "@/models/coupon.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const isAdmin = await adminMiddleware(req);
    if (!isAdmin) return apiError("Unauthorized Adnin Access", 401);

    // 1. Basic Counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCoupons = await Coupon.countDocuments();

    // 2. Total Revenue & Sales Data (Aggregate)
    // We aggregate paid orders only. If COD, we might count it if it's delivered, or just all non-cancelled orders.
    // Let's count all orders that are not 'cancelled'.
    const orders = await Order.find({ orderStatus: { $ne: "cancelled" } });
    
    let totalRevenue = 0;
    let deliveredOrders = 0;
    let processingOrders = 0;
    let cancelledOrders = 0;
    
    // Monthly sales array formatted for recharts
    const currentYear = new Date().getFullYear();
    const monthlySalesMap: Record<string, number> = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    orders.forEach(order => {
      totalRevenue += order.totalPrice;

      if (order.orderStatus === "delivered") {
        deliveredOrders += 1;
      } else if (["confirmed", "processing", "shipped", "out_for_delivery"].includes(order.orderStatus)) {
        processingOrders += 1;
      } else if (order.orderStatus === "cancelled") {
        cancelledOrders += 1;
      }
      
      const orderDate = new Date(order.createdAt);
      if (orderDate.getFullYear() === currentYear) {
        const monthIndex = orderDate.getMonth();
        const monthName = monthNames[monthIndex];
        monthlySalesMap[monthName] += order.totalPrice;
      }
    });

    const salesData = Object.keys(monthlySalesMap).map(key => ({
      name: key,
      sales: monthlySalesMap[key]
    }));

    // Filter out future months in the current year if we want, or keep all to 0
    const currentMonth = new Date().getMonth();
    const filteredSalesData = salesData.slice(0, currentMonth + 1);

    return apiSuccess({
      counts: {
        products: totalProducts,
        orders: totalOrders,
        users: totalUsers,
        coupons: totalCoupons,
      },
      revenue: totalRevenue,
      deliveredOrders,
      processingOrders,
      cancelledOrders,
      salesData: filteredSalesData
    }, "Admin stats retrieved successfully");

  } catch (error) {
    return handleError(error);
  }
}
