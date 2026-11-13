const mongoose = require('mongoose');

mongoose.connection.on('connected',()=>{
    console.log('MongoDB connected successfully');
});

mongoose.connection.on('error',(error)=>{
    console.error('MongoDB connection error:',error.message);
});

mongoose.connection.on('disconnected',()=>{
    console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected',()=>{
    console.log('MongoDB reconnected');
});

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");
    } catch (error){
        console.error('Initial MongoDB connection failed:',error.message);
        throw error;
    }
};

module.exports = connectDB;