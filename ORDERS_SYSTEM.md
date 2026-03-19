# Production-Level Order System Documentation

## Overview

This is a comprehensive, industry-level order management system for the Healthebites e-commerce platform. It includes order creation, management, tracking, and analytics with production-grade features.

## Key Features

### ✅ Production Features

1. **Unique Order Numbers** - Formatted as `ORD-YYYYMMDD-XXXXXX`
2. **Order Status Timeline** - Track all status changes with timestamps
3. **Transaction-Safe Order Creation** - Uses MongoDB sessions for atomic transactions
4. **Stock Management** - Automatic stock updates and restoration on cancellation
5. **Tax Calculation** - Automatic tax calculation (5% GST)
6. **Coupon Management** - Validation, discount calculation, and usage tracking
7. **Comprehensive Validation** - Zod-based input validation with detailed error messages
8. **Payment Methods** - Support for Razorpay, COD, UPI, and Netbanking
9. **Multiple Address Support** - Shipping and billing address support with coordinates
10. **Delivery Boy Assignment** - Track which delivery personnel is handling the order
11. **Order Tracking** - Tracking numbers and location-based updates
12. **Return Window** - 30-day return window tracking
13. **Order Analytics** - Statistics for revenue, orders, and trends
14. **Admin Controls** - Full order management for admins

## Architecture

### Model: Order Schema

```typescript
orderNumber: string       // Unique order identifier
user: ObjectId           // Reference to User
orderItems: []           // Array of products ordered
shippingAddress: {}      // Delivery location
billingAddress: {}       // Optional billing address
paymentMethod: enum      // Payment type
paymentStatus: enum      // Payment state (pending/paid/failed/refunded)
paymentId: string        // Payment gateway reference
orderStatus: enum        // Order state
statusTimeline: []       // History of status changes
subtotal: number         // Pre-tax amount
tax: number             // Tax amount
shippingPrice: number   // Shipping cost
couponCode: string      // Applied coupon
couponDiscount: number  // Discount amount
discount: number        // Additional discounts
totalPrice: number      // Final price
trackingNumber: string  // Shipping tracking number
deliveryBoy: ObjectId   // Delivery personnel
```

### Service Layer: orderService.ts

Industrial-grade service layer with the following functions:

#### Order Creation
```typescript
createOrder(params: CreateOrderParams)
```
- Validates stock availability
- Applies coupon discounts
- Calculates taxes
- Uses MongoDB transactions
- Updates product stock
- Clears user cart

#### Status Management
```typescript
updateOrderStatus(orderId, newStatus, description?, location?)
```
- Updates order status
- Maintains status timeline
- Auto-updates timestamps (deliveredAt, cancelledAt)

#### Order Cancellation
```typescript
cancelOrder(orderId, cancellationReason?)
```
- Validates order can be cancelled
- Restores product stock
- Refunds payment
- Maintains audit trail

#### Retrieval Functions
```typescript
getOrderById(orderId, userId?)           // Get single order
getUserOrders(userId, page, limit)       // Paginated user orders
getOrderStats(userId?)                   // Order analytics
```

#### Utility Functions
```typescript
generateOrderNumber()                    // Create unique order ID
calculateTax(subtotal, taxRate)          // Tax calculation
calculateEstimatedDelivery(daysRange)    // Delivery estimate
validateStockAvailability(items)         // Check inventory
processCouponDiscount(code, subtotal)    // Validate & apply coupons
```

## API Endpoints

### List Orders
```
GET /api/orders?page=1&limit=10&status=delivered&stats=true
```
- **Auth**: Required
- **Admin**: Can view all orders
- **User**: Can view only their own
- **Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by status
  - `stats`: Include statistics
  - `all`: Admin only - view all orders

**Response**:
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "total": 150,
    "pages": 15,
    "stats": {
      "totalOrders": 150,
      "totalRevenue": 50000,
      "avgOrderValue": 333,
      "deliveredOrders": 140,
      "cancelledOrders": 10
    }
  }
}
```

### Create Order
```
POST /api/orders
```
- **Auth**: Required
- **Body**:
```json
{
  "orderItems": [
    {
      "product": "507f1f77bcf86cd799439011",
      "name": "Product Name",
      "price": 500,
      "quantity": 2,
      "image": "https://example.com/image.jpg"
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "mobile": "9876543210",
    "pincode": "110001",
    "state": "Delhi",
    "city": "New Delhi",
    "area": "Chandni Chowk",
    "landmark": "Near Metro"
  },
  "paymentMethod": "razorpay",
  "couponCode": "SAVE20",
  "notes": "Please deliver after 5 PM"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "orderNumber": "ORD-20260319-000001",
      "totalPrice": 2300,
      "orderStatus": "confirmed",
      "paymentStatus": "pending"
    }
  },
  "statusCode": 201
}
```

### Get Order
```
GET /api/orders/:id
```
- **Auth**: Required
- **Authorization**: User can view own orders, admin can view any

**Response**:
```json
{
  "success": true,
  "data": {
    "order": {...}
  }
}
```

### Update Order Status
```
PATCH /api/orders/:id
```
- **Auth**: Required
- **Admin**: Required
- **Body**:
```json
{
  "status": "shipped",
  "description": "Package dispatched",
  "location": "New Delhi Hub"
}
```

### Cancel Order
```
DELETE /api/orders/:id
```
- **Auth**: Required
- **Body**:
```json
{
  "cancellationReason": "Changed my mind"
}
```

## Validation Rules

### Order Item
- `product`: Valid ObjectId
- `name`: Required, min 1 char
- `price`: Must be positive
- `quantity`: 1-100 range
- `image`: Valid URL (optional)

### Shipping Address
- `fullName`: 2-50 characters
- `mobile`: Exactly 10 digits
- `pincode`: Exactly 6 digits
- `state`: Min 2 characters
- `city`: Min 2 characters
- `area`: Min 2 characters

### Payment Methods
- `razorpay` - Online payment
- `cod` - Cash on delivery
- `upi` - UPI payment
- `netbanking` - Net banking

## Order Status Workflow

```
confirmed → processing → shipped → out_for_delivery → delivered
    ↓                                                      ↓
  cancelled ←――――――――――――――――――――――――――――――――――――――――― returned
```

### Status Meanings
- **confirmed**: Order created and confirmed
- **processing**: Order is being prepared
- **shipped**: Order dispatched from warehouse
- **out_for_delivery**: Order with delivery partner
- **delivered**: Order delivered to customer
- **cancelled**: Order cancelled by user/admin
- **returned**: Order returned after delivery

## Payment Status workflow

```
pending → paid → refunded (if cancelled)
   ↓
 failed (retry possible)
```

## Utilities (orderUtils.ts)

Helper functions for frontend integration:

```typescript
// Display functions
formatOrderNumber(orderId)           // Format display
getOrderStatusColor(status)          // Bootstrap colors
getPaymentStatusColor(status)        // Bootstrap colors
formatDateIST(date)                 // IST timezone format
formatCurrency(amount)              // ₹ formatting
getOrderSummary(order)              // Quick overview
getOrderBreakdown(order)            // Cost breakdown
generateInvoiceData(order)          // Invoice generation

// Business Logic
canCancelOrder(order)               // Check if cancellable
canReturnOrder(order)               // Check if returnable
getReturnWindowDays(order)          // Remaining days
isPaymentRequired(order)            // Payment pending?

// Filter options
getOrderStatusOptions()             // Status dropdown
getPaymentStatusOptions()           // Payment status dropdown
```

## Error Handling

All endpoints return structured error responses:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Common Errors
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (not permission)
- `400`: Validation failed
- `404`: Order not found
- `409`: Stock unavailable

## Database Indexes

For optimal performance:

```typescript
orderNumber (unique)
user + createdAt
paymentStatus
orderStatus
createdAt
```

## Future Enhancements

- [ ] Order notifications (Email/SMS)
- [ ] Real-time tracking with WebSockets
- [ ] PDF invoice generation
- [ ] Refund management system
- [ ] Return pickup scheduling
- [ ] Order recommendations
- [ ] Delivery analytics dashboard
- [ ] Webhook integration for payment gateways

## Example Frontend Usage

### Create Order
```typescript
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderItems: cart,
    shippingAddress: selectedAddress,
    paymentMethod: 'razorpay',
    couponCode: coupon
  })
});
const { data } = await response.json();
```

### Get User Orders
```typescript
const response = await fetch(
  '/api/orders?page=1&limit=10&status=delivered'
);
const { data } = await response.json();
```

### Update Order (Admin)
```typescript
const response = await fetch(`/api/orders/${orderId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'shipped',
    description: 'Package dispatched'
  })
});
```

## Security Considerations

1. ✅ Authentication required for all endpoints
2. ✅ Authorization checks (users/admins)
3. ✅ Input validation with Zod
4. ✅ Transaction-safe database operations
5. ✅ Stock race condition prevention
6. ✅ Coupon usage limit enforcement
7. ✅ Order ownership verification

## Performance

- Indexed queries for fast retrieval
- Pagination support for large datasets
- Aggregation pipeline for analytics
- Lean queries where data structures not needed
- MongoDB sessions for transaction support

---

**Version**: 1.0.0  
**Last Updated**: March 19, 2026
