// emailService.js

import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

const SendGridMailer = async ({ to, subject, html, id, variable }) => {
   try {
      const response = await resend.emails.send({
         from: process.env.RESEND_FROM_EMAIL,
         to,
         subject,
         html,
         template: {
            id: id,
            variables: variable,
         },
      });

      console.log("✅ Email sent successfully");
      console.log("📨 Resend ID:", response?.data?.id || "Not available");

      return true;
   } catch (error) {
      console.error("❌ Error sending email:", error.message);
      return false;
   }
};

export default SendGridMailer;
