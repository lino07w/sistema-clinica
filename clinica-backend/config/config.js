 import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'test_secret',
    expire: process.env.JWT_EXPIRE || '7d'
  },

  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          process.env.FRONTEND_URL,
          'https://clinica-frontend.onrender.com'  // Ajusta con tu URL real
        ]
      : [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:5174',
          'http://127.0.0.1:5174',
          'http://localhost:5500',
          'http://127.0.0.1:5500'
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