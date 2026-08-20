// emailService.js

import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SendGridMailer = async ({ to, subject, html, id, variable }) => {
   const maxAttempts = 3;

   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
         const response = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to,
            subject,
            html,
            template: {
               id,
               variables: variable,
            },
         });

         console.log(`📧 Resend attempt ${attempt}:`, response);

         // IMPORTANT:
         // Resend can return { error } without throwing an exception.
         if (response?.error) {
            console.error(`❌ Resend error on attempt ${attempt}:`, response.error);

            const isTransientError = response.error.name === "application_error" && response.error.message?.includes("request could not be resolved");

            // Retry only transient errors
            if (isTransientError && attempt < maxAttempts) {
               await sleep(500 * attempt);
               continue;
            }

            return {
               success: false,
               error: response.error,
            };
         }

         console.log("✅ Email sent successfully");
         console.log("📨 Resend ID:", response?.data?.id);

         return {
            success: true,
            data: response.data,
         };
      } catch (error) {
         console.error(`❌ Exception on email attempt ${attempt}:`, error);

         if (attempt < maxAttempts) {
            await sleep(500 * attempt);
            continue;
         }

         return {
            success: false,
            error,
         };
      }
   }

   return {
      success: false,
      error: {
         message: "Unable to send email",
      },
   };
};

export default SendGridMailer;
