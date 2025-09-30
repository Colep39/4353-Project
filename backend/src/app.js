// express app configuration, includes middleware and routes for our backend server
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send("API is up and going....");
});

module.exports = app;