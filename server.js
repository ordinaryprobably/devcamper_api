const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');

dotenv.config({ path: './config/config.env' });
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

const bootcamps = require('./routes/bootcamps');

// 개발 상태일 때 User Request 를 Logging 해주는 외부 모듈.
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/bootcamps', bootcamps);


const server = app.listen(PORT, () => {
  console.log(`server running in [${process.env.NODE_ENV} mode] on port ${PORT}`.yellow)
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server % Exit process
  server.close(() => process.exit(1));
});