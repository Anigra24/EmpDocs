const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req,res)=>{
    const dbstate = mongoose.connection.readyState;

    const databasestatus = dbstate ===1 ? 'connected' : 'disconnected';

    res.status(200).json({
        success: true,
        message:"server is healthy",
        data:{
            uptime: Number(process.uptime().toFixed(2)),
            databse: databasestatus,
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