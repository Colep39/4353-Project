// express app configuration, includes middleware and routes for our backend server
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const manageEventRoutes = require('./routes/manageEventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/eventManagement', manageEventRoutes);
app.use('/api/notifications', notificationRoutes);


app.get('/', (req, res) => {
    res.send("API is up and going....");
});

module.exports = app;