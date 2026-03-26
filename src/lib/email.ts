import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({

  service: "gmail",

  auth: {

    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASS

  }

});

export async function sendOtpEmail(email: string, otp: string) {

  await transporter.sendMail({

    from: process.env.EMAIL_FROM,

    to: email,

    subject: "Verify your email - Makhana Store",

    html: `

    <div style="
      max-width:500px;
      margin:auto;
      font-family:Arial,sans-serif;
      border:1px solid #eee;
      padding:30px;
      border-radius:8px
    ">

      <h2 style="text-align:center;color:#333">
        Makhana Store
      </h2>

      <p style="font-size:16px">
        Hello,
      </p>

      <p>
        Use the following OTP to verify your email address.
      </p>

      <div style="
        text-align:center;
        margin:30px 0;
      ">

        <span style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:6px;
          background:#f4f4f4;
          padding:10px 20px;
          border-radius:6px;
        ">
          ${otp}
        </span>

      </div>

      <p>
        This OTP will expire in <b>5 minutes</b>.
      </p>

      <p style="font-size:14px;color:#777">

        If you didn't request this email, you can safely ignore it.

      </p>

      <hr/>

      <p style="
        font-size:12px;
        text-align:center;
        color:#aaa
      ">

        © ${new Date().getFullYear()} Makhana Store

      </p>

    </div>

    `
  });
}

export async function sendAdminOrderEmail(order: any, adminEmail: string) {
  const orderItemsHtml = order.orderItems.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
         ${item.product?.name || 'Product'} (x${item.quantity})
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${item.price * item.quantity}
      </td>
    </tr>
  `).join("");

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: `New Order Received! #${order._id.toString().substring(0, 8)}`,
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eaebec;">
      
      <!-- Header -->
      <div style="background-color: #1F4D36; padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">New Order Alert! 🎉</h1>
        <p style="color: #e0e7e3; margin: 10px 0 0 0; font-size: 15px;">A new order has been placed on HealtheBites.</p>
      </div>
      
      <!-- Content Body -->
      <div style="padding: 30px;">
        
        <!-- Order Summary Box -->
        <div style="background-color: #f8faf9; border-radius: 8px; padding: 20px; margin-bottom: 25px; border: 1px solid #edf2f0;">
          <h2 style="margin: 0 0 15px 0; color: #1F4D36; font-size: 18px; border-bottom: 2px solid #e2e8e5; padding-bottom: 10px;">Order Details</h2>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 40%;">Order ID:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 500; text-align: right;">#${order._id.toString().substring(0, 8)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Total Amount:</td>
              <td style="padding: 8px 0; color: #1F4D36; font-weight: 700; text-align: right;">₹${order.totalPrice}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Payment Method:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 500; text-align: right; text-transform: uppercase;">${order.paymentMethod}</td>
            </tr>
          </table>
        </div>

        <!-- Items Table -->
        <h3 style="color: #334155; font-size: 16px; margin: 0 0 15px 0;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 15px; margin-bottom: 30px;">
          ${orderItemsHtml}
          <tr>
            <td style="padding: 15px 10px; font-weight: 600; color: #0f172a; text-align: right;">Grand Total:</td>
            <td style="padding: 15px 10px; font-weight: 700; color: #1F4D36; text-align: right; font-size: 18px;">₹${order.totalPrice}</td>
          </tr>
        </table>
        
        <!-- Customer Info Box -->
        <div style="background-color: #f8fbff; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6;">
          <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px;">Customer Information</h3>
          <p style="margin: 0 0 8px 0; color: #475569; font-size: 15px;"><strong>Name:</strong> ${order.shippingAddress?.fullName || 'N/A'}</p>
          <p style="margin: 0 0 8px 0; color: #475569; font-size: 15px;"><strong>Phone:</strong> ${order.shippingAddress?.mobile || 'N/A'}</p>
          <p style="margin: 0; color: #475569; font-size: 15px;"><strong>Address:</strong> ${order.shippingAddress?.area}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}</p>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 35px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://healthebites.com'}/admin/orders" style="background-color: #1F4D36; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">View Dashboard</a>
        </div>
        
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">This is an automated message from HealtheBites System.</p>
        <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} HealtheBites. All rights reserved.</p>
      </div>
      
    </div>
    `
  });
}