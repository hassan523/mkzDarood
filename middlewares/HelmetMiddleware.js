import helmet from "helmet";

const SecurityHeaders = helmet({
   contentSecurityPolicy: {
      useDefaults: true,
      directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "http://localhost:5173", "https://mkzdarood.vercel.app", "https://www.mkzdarood.com", "https://www.mkzdarood.com/"],
         connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000", "http://localhost:5173", "https://mkzdarood.vercel.app", "https://www.mkzdarood.com", "https://www.mkzdarood.com/"],
         fontSrc: ["'self'", "https:", "data:"],
         objectSrc: ["'none'"],
      },
   },
   crossOriginEmbedderPolicy: false,
   crossOriginResourcePolicy: { policy: "cross-origin" },
});

export default SecurityHeaders;
