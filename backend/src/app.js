// express app configuration, includes middleware and routes for our backend server
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const manageEventRoutes = require('./routes/manageEventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const historyRoutes = require('./routes/historyRoutes');
const stateRoutes = require('./routes/stateRoutes.js');
const skillsRoutes = require('./routes/skillsRoutes');
const uploadRoutes = require("./routes/upload");


const app = express();

// middleware
app.use(cors({
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/eventManagement', manageEventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/volunteerHistory', historyRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/skills', skillsRoutes);
app.use("/api/upload", uploadRoutes);

app.get('/', (req, res) => {
    res.send("API is up and going....");
});

module.exports = app;