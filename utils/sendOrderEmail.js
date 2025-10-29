

const nodemailer = require("nodemailer");


const sendWelcomeEmail = async(name, email, productName)=>{
    
        
    
    try {

        // Create a test account or replace with real credentials.
        const transporter = nodemailer.createTransport({
        host: "smtp.resend.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: "resend",
            pass: process.env.RESEND_API_KEY,
        },
    });

    // Wrap in an async IIFE so we can use await.
    (async () => {
    const info = await transporter.sendMail({
        from: '"QuickInvoice NG" <hello@quickinvoiceng.com>',
        to: email,
        subject: "Order Confirmation",
        text: "Hello world?", // plain‑text body
        html: `
           <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MediStore Order Confirmation</title>
    <style>
      body {
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f6f9fc;
        color: #333333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      .header {
        background-color: #00477B;
        color: #ffffff;
        text-align: center;
        padding: 30px 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .body {
        padding: 30px 25px;
        text-align: left;
      }
      .body h2 {
        color: #00477B;
        font-size: 20px;
      }
      .highlight {
        color: #00477B;
        font-weight: 600;
      }
      .btn {
        display: inline-block;
        margin-top: 20px;
        padding: 12px 24px;
        background-color: #50D6FE;
        color: #ffffff !important;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        transition: background-color 0.3s ease;
      }
      .btn:hover {
        background-color: #3abbe0;
      }
      .divider {
        margin: 30px 0;
        border-top: 1px solid #e0e0e0;
      }
      .footer {
        background-color: #00477B;
        color: #ffffff;
        text-align: center;
        padding: 20px 15px;
        font-size: 13px;
      }
      .footer a {
        color: #50D6FE;
        text-decoration: none;
      }
      @media (max-width: 600px) {
        .body {
          padding: 25px 20px;
        }
        .btn {
          width: 100%;
          text-align: center;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Thank You for Your Purchase!</h1>
      </div>
      <!-- Body -->
      <div class="body">
        <h2>Hello ${name},</h2>
        <p>
          We're delighted to let you know that your order has been successfully processed.
        </p>
        <p>
          You have successfully purchased <span class="highlight">${productName}</span>.
        </p>
        <p>
          A receipt has been sent to your email: <span class="highlight">${email}</span>.
          Your order is being prepared and will be shipped to you soon.
        </p>
        <a href="https://medistore.com/orders" class="btn">View My Order</a>
        <div class="divider"></div>
        <p style="font-size: 14px; color: #555;">
          If you have any questions about your order, feel free to contact our support team.
        </p>
      </div>
      <!-- Footer -->
      <div class="footer">
        <p><strong>MediStore</strong>, Delivering trusted medicines with care.</p>
        <p>
          📍 [Your Address Here] <br />
          📞 <a href="tel:+2348012345678">+234 801 234 5678</a> |
          📧 <a href="mailto:support@medistore.com">support@medistore.com</a>
        </p>
        <p>© {{year}} MediStore. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>

       `,
    });

    console.log("✅ Order email sent via Resend", info.messageId );
    // console.log("Message sent:", info.messageId);
    })();
    } catch (error) {
        console.error("❌ Failed to send email:", error);
    }

}

module.exports = sendWelcomeEmail