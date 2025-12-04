import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '7d'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : [
          'http://localhost:5500', 
          'http://127.0.0.1:5500', 
          'http://localhost:5501', 
          'http://127.0.0.1:5501',
          'http://localhost:5173',  // ← AGREGAR ESTE (React/Vite)
          'http://127.0.0.1:5173',  // ← AGREGAR ESTE
          'http://localhost:5174',  // 👈 AGREGAR
          'http://127.0.0.1:5174'   // 👈 AGREGAR
        ],
    credentials: true
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  },
  
  defaultAdmin: {
    username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
    password: process.env.DEFAULT_ADMIN_PASSWORD || '123456'
  },
  
  dataPath: './data'
};

export default config;