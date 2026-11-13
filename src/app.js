const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const employeeRoutes = require('./routes/employee.routes');
const documentRoutes = require('./routes/document.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;

    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        data: {
            uptime: Number(process.uptime().toFixed(2)),
            database: dbState === 1 ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        }
    });
});

app.use('/api/employees', employeeRoutes);
app.use('/api/documents', documentRoutes);


app.use((req,res)=>{
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use(errorHandler);

module.exports = app;