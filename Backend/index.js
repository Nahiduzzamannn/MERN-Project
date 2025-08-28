const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { DbConnection } = require('./DB/connection');
// Fix path: folder is `Routes` and file is `postRouters.js`
const postRoutes = require('./Routes/postRouters');

DbConnection();

const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

// health
app.get('/home', (req, res) => {
  res.send('Server is running...');
});

// posts API
app.use('/api/posts', postRoutes);

// ...existing code...
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});