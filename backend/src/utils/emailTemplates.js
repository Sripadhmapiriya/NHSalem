import dotenv from 'dotenv'
dotenv.config()

const BASE_URL = process.env.CORS_ORIGIN || 'https://nh-salem.vercel.app'

// Common wrapper template to maintain premium styling
function baseLayout(title, contentHtml, unsubscribeUrl = null) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .header {
          background-color: #0f172a;
          padding: 24px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 900;
          letter-spacing: 0.05em;
        }
        .header p {
          color: #94a3b8;
          margin: 4px 0 0 0;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          font-weight: 700;
        }
        .body {
          padding: 32px 24px;
          color: #334155;
          line-height: 1.6;
        }
        .body h2 {
          color: #0f172a;
          margin-top: 0;
          font-size: 20px;
          font-weight: 700;
        }
        .btn {
          display: inline-block;
          background-color: #166534;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 6px;
          margin: 20px 0;
          text-align: center;
        }
        .btn:hover {
          background-color: #15803d;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .table th {
          background-color: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
          padding: 12px;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
        }
        .table td {
          border-bottom: 1px solid #f1f5f9;
          padding: 12px;
          font-size: 14px;
          color: #334155;
        }
        .totals-section {
          float: right;
          width: 250px;
          margin-top: 10px;
          margin-bottom: 20px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 14px;
        }
        .totals-row.grand-total {
          font-weight: 700;
          font-size: 16px;
          border-top: 1px solid #cbd5e1;
          padding-top: 8px;
          margin-top: 8px;
          color: #0f172a;
        }
        .details-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 16px;
          margin: 20px 0;
          font-size: 13px;
        }
        .details-box h3 {
          margin-top: 0;
          color: #0f172a;
          font-size: 14px;
        }
        .footer {
          background-color: #0f172a;
          padding: 24px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
          border-top: 1px solid #1e293b;
        }
        .footer a {
          color: #38bdf8;
          text-decoration: underline;
        }
        .clear {
          clear: both;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NH Salem Sea Foods</h1>
          <p>Fresh Catch at Your Fingertips</p>
        </div>
        <div class="body">
          ${contentHtml}
        </div>
        <div class="footer">
          <p style="margin: 0 0 8px 0;">NH Salem Sea Foods, Salem, Tamil Nadu, India</p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} NH Salem Sea Foods. All rights reserved.</p>
          ${unsubscribeUrl ? `
            <p style="margin: 16px 0 0 0; font-size: 11px;">
              Want to stop receiving these? <a href="${unsubscribeUrl}">Unsubscribe here</a>
            </p>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `
}

// 1. ORDER PLACED (Customer Template)
export function orderPlacedCustomer({ orderRef, customerName, items, total, address, slot }) {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.weight || 'N/A'}</td>
      <td>₹${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('')

  const subtotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
  const deliveryCharge = total >= 499 ? 0 : 40
  const discount = subtotal + deliveryCharge - total

  const contentHtml = `
    <!-- Order ID Banner -->
    <div style="background:#f0fdf4; border:2px solid #166534; 
                border-radius:8px; padding:16px; text-align:center; 
                margin-bottom:24px;">
      <p style="margin:0; font-size:12px; color:#666; 
                text-transform:uppercase; letter-spacing:1px;">
        Your Order ID
      </p>
      <p style="margin:4px 0 0; font-size:28px; font-weight:900; 
                color:#166534; letter-spacing:2px;">
        ${orderRef}
      </p>
      <p style="margin:8px 0 0; font-size:12px; color:#888;">
        Save this ID to track your order anytime
      </p>
    </div>

    <h2>Your Order #${orderRef} is Confirmed! 🎉</h2>
    <p>Thank you for shopping with NH Salem Sea Foods, <strong>${customerName}</strong>! We've received your order and are getting it ready for dispatch.</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Weight</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals-section">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>₹${subtotal.toLocaleString()}</span>
      </div>
      ${discount > 0 ? `
      <div class="totals-row" style="color: #166534;">
        <span>Discount:</span>
        <span>-₹${discount.toLocaleString()}</span>
      </div>
      ` : ''}
      <div class="totals-row">
        <span>Delivery:</span>
        <span>${deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
      </div>
      <div class="totals-row grand-total">
        <span>Total:</span>
        <span>₹${total.toLocaleString()}</span>
      </div>
    </div>
    <div class="clear"></div>

    <div class="details-box">
      <h3>Delivery Details</h3>
      <p><strong>Address:</strong> ${address.line1}, ${address.city}, ${address.state} - ${address.pincode}</p>
      <p><strong>Delivery Slot:</strong> ${slot}</p>
    </div>

    <div style="text-align:center; margin-top:24px;">
      <a href="${BASE_URL}/track-order/${orderRef}"
         style="display:inline-block; background:#166534; color:white; padding:12px 32px; 
                border-radius:24px; text-decoration:none; 
                font-weight:600; font-size:14px;">
        Track Order #${orderRef} →
      </a>
    </div>
  `
  return baseLayout(`Order Confirmed - #${orderRef}`, contentHtml)
}

// 2. NEW ORDER ALERT (Admin Template)
export function newOrderAdmin({ orderRef, customerName, customerEmail, customerPhone, items, total, address, slot, paymentMethod, orderId }) {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity} x ${item.weight || 'N/A'}</td>
      <td>₹${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('')

  const contentHtml = `
    <h2>🆕 New Order #${orderRef} — Action Required</h2>
    <p>A new order has been placed and needs attention from the shop administrator.</p>

    <div class="details-box">
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty & Weight</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals-row grand-total" style="font-size: 16px; margin: 15px 0;">
      <strong>Total Bill:</strong> <span>₹${total.toLocaleString()}</span>
    </div>

    <div class="details-box">
      <h3>Delivery Preferences</h3>
      <p><strong>Address:</strong> ${address.line1}, ${address.city}, ${address.state} - ${address.pincode}</p>
      <p><strong>Time Slot:</strong> ${slot}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="${BASE_URL}/admin/orders?accept=${orderId}" class="btn" style="background-color: #166534; margin-right: 12px;">Accept Order</a>
      <a href="${BASE_URL}/admin/orders" class="btn" style="background-color: #334155;">View Dashboard</a>
    </div>
  `
  return baseLayout(`New Order Alert - #${orderRef}`, contentHtml)
}

// 3. ORDER CONFIRMED (Customer Accepted Template)
export function orderConfirmedCustomer({ orderRef, customerName, items, total, address, slot }) {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>₹${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('')

  const subtotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
  const deliveryCharge = total >= 499 ? 0 : 40
  const discount = subtotal + deliveryCharge - total

  const contentHtml = `
    <!-- Order ID Banner -->
    <div style="background:#f0fdf4; border:2px solid #166534; 
                border-radius:8px; padding:16px; text-align:center; 
                margin-bottom:24px;">
      <p style="margin:0; font-size:12px; color:#666; 
                text-transform:uppercase; letter-spacing:1px;">
        Your Order ID
      </p>
      <p style="margin:4px 0 0; font-size:28px; font-weight:900; 
                color:#166534; letter-spacing:2px;">
        ${orderRef}
      </p>
      <p style="margin:8px 0 0; font-size:12px; color:#888;">
        Save this ID to track your order anytime
      </p>
    </div>

    <h2>✅ Your Order #${orderRef} has been Confirmed!</h2>
    <p>Great news, <strong>${customerName}</strong>! Your order has been accepted by our store manager and is currently being prepared with fresh, premium seafood.</p>

    <table class="table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals-section">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>₹${subtotal.toLocaleString()}</span>
      </div>
      ${discount > 0 ? `
      <div class="totals-row" style="color: #166534;">
        <span>Discount:</span>
        <span>-₹${discount.toLocaleString()}</span>
      </div>
      ` : ''}
      <div class="totals-row">
        <span>Delivery:</span>
        <span>${deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
      </div>
      <div class="totals-row grand-total">
        <span>Total:</span>
        <span>₹${total.toLocaleString()}</span>
      </div>
    </div>
    <div class="clear"></div>

    <div class="details-box">
      <h3>Estimated Dispatch Information</h3>
      <p><strong>Delivery Address:</strong> ${address.line1}, ${address.city}, ${address.state} - ${address.pincode}</p>
      <p><strong>Scheduled Slot:</strong> ${slot}</p>
    </div>

    <div style="text-align:center; margin-top:24px;">
      <a href="${BASE_URL}/track-order/${orderRef}"
         style="display:inline-block; background:#166534; color:white; padding:12px 32px; 
                border-radius:24px; text-decoration:none; 
                font-weight:600; font-size:14px;">
        Track Order #${orderRef} →
      </a>
    </div>
  `
  return baseLayout(`Order Confirmed - #${orderRef}`, contentHtml)
}


// 5. PRODUCT / OFFER / PLAN UPDATE (Broadcast Template)
export function productOfferUpdate({ updateType, subject, content, unsubscribeUrl }) {
  let innerContentHtml = ''

  if (updateType === 'new_product') {
    innerContentHtml = `
      <h2>🐟 New Arrival: ${content.name}</h2>
      ${content.image_url ? `<img src="${content.image_url}" alt="${content.name}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 6px; margin: 15px 0;" />` : ''}
      <p>${content.tagline || 'We have added a delicious new item to our collection. Try it fresh today!'}</p>
      <p style="font-size: 18px; font-weight: 700; color: #166534;">Price: ₹${content.base_price?.toLocaleString()} (Category: ${content.category})</p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${BASE_URL}" class="btn">Buy Now</a>
      </div>
    `
  } else if (updateType === 'new_promotion') {
    innerContentHtml = `
      <h2>🎉 New Offer: Use code ${content.code}</h2>
      <p><strong>Discount:</strong> ${content.description || 'Special promo code valid for all items.'}</p>
      <div class="details-box" style="text-align: center; background-color: #fef08a; border-color: #eab308; padding: 12px; margin: 15px 0;">
        <span style="font-size: 20px; font-weight: 900; letter-spacing: 0.05em; color: #854d0e;">Code: ${content.code}</span>
      </div>
      ${content.expires_at ? `<p style="font-size: 12px; color: #64748b;">*Valid until ${new Date(content.expires_at).toLocaleDateString()}</p>` : ''}
      <div style="text-align: center; margin-top: 20px;">
        <a href="${BASE_URL}" class="btn">Use Code Now</a>
      </div>
    `
  } else {
    // General
    innerContentHtml = `
      <h2>🔥 Latest Updates from NH Salem Sea Foods</h2>
      <p>${content.message || content.description || 'We have fresh catches and great offers waiting for you!'}</p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${BASE_URL}" class="btn">Visit Store</a>
      </div>
    `
  }

  return baseLayout(subject, innerContentHtml, unsubscribeUrl)
}

// 6. CITY LAUNCH INTEREST REGISTERED (Customer Template)
export function cityInterestRegistered({ email, cityName }) {
  const contentHtml = `
    <h2>We've registered your interest! 📍</h2>
    <p>Thank you for your interest in NH Salem Sea Foods! We have successfully registered your request to be notified when we launch in <strong>${cityName}</strong>.</p>
    <p>Our team is working hard to bring the freshest, premium seafood to your neighborhood. We will email you the moment we are live!</p>
    
    <div class="details-box" style="background-color: #f0fdf4; border-color: #bbf7d0; text-align: center;">
      <p style="margin: 0; color: #166534; font-weight: 700;">🌊 Launching Soon in ${cityName}</p>
      <p style="margin: 5px 0 0 0; font-size: 14px;">We will contact you at <strong>${email}</strong> once delivery slots are open.</p>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="${BASE_URL}" class="btn">Explore Our Menu</a>
    </div>
  `
  return baseLayout(`Interest Registered for ${cityName} - NH Salem Sea Foods`, contentHtml)
}

// 7. CITY LAUNCHED / NOW LIVE (Customer Announcement Template)
export function cityLaunchedNotification({ cityName }) {
  const contentHtml = `
    <h2>Great News: NH Salem is now LIVE in ${cityName}! 🎉</h2>
    <p>The wait is over! We have officially launched our premium seafood delivery service in <strong>${cityName}</strong>.</p>
    <p>You can now browse our daily catch, order fresh fish, prawns, crabs, lobsters, and more, and choose your preferred delivery slots.</p>
    
    <div class="details-box" style="background-color: #f0fdf4; border-color: #bbf7d0; text-align: center;">
      <p style="margin: 0; color: #166534; font-weight: 700;">🎁 WELCOME OFFER</p>
      <p style="margin: 5px 0 0 0; font-size: 16px;">Use code <strong>FRESH100</strong> for free delivery on your first order above ₹499!</p>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="${BASE_URL}/stores" class="btn">Order Now in ${cityName}</a>
    </div>
  `
  return baseLayout(`NH Salem is now LIVE in ${cityName}! 🐟`, contentHtml)
}

