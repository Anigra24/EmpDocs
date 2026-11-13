require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

let server;

const startserver = async()=>{
    try{
        await connectDB();

        server = app.listen(PORT,()=>{
            console.log(`EmpDOcs Server running on port ${PORT}`);
        });
    } catch (error){
        console.error('Server Startup failed due to database connection.');
        process.exit(1);
    }
};

const shutdown = async(signal)=>{
    console.log(`${signal} recieved. initiating graceful shutdown...`);

    try{
        if(server){
            await new Promise((resolve,reject)=>{
                server.close((error)=>{
                    if(error){
                        reject(error);
                    }else{
                        resolve();
                    }
                });
            });

            console.log('Server closed');
        }

        await mongoose.connection.close();

        console.log('MongoDb connection closed');

        process.exit(0);
    } catch(error) {
        console.error('Error during shutdown:',error.message);
        process.exit(1);
    }
};

process.on('SIGINT',()=> shutdown('SIGINT'));
process.on('SIGTERM',()=> shutdown('SIGTERM'));

startserver();