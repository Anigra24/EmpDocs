const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req,res)=>{
    const dbState = mongoose.connection.readyState;

    const dbStates = {
        0:'disconnected',
        1:'connected',
        2:'connecting',
        3:'disconnecting'
    };

    const databaseStatus = dbStates[dbState] || 'unknown';

    const isConnected = dbState === 1;

    res.status(isConnected ? 200 : 503).json({
        success: isConnected,
        message: isConnected ? "server is healthy": "database is unavailable",
        data:{
            uptime: Number(process.uptime().toFixed(2)),
            databse: databaseStatus,
            timestamp: new Date().toISOString()
        }
    });
});

app.use((req,res)=>{
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

module.exports = app;