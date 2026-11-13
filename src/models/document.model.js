const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        employee:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required:[true,' Employee reference is required']
        },

        originalName:{
            type:String,
            required:[true, 'Original file name is required'],
            trim: true
        },

        storedName:{
            type:String,
            required:[true,'Stored file is required'],
            unique:true,
            trim:true
        },

        mimeType:{
            type:String,
            required:[true,'MIME type is required'],
            trim: true
        },

        path:{
            type:String,
            required:[true,'File path is required'],
            trim:true
        },

        category:{
            type:String,
            enum:{
                values:['ID_PROOF','OFFER_LETTER','CERTIFICATE','DATA_SHEET','OTHER'],
                message: 'Invalid document category'
            },
            default:'OTHER'
        }
    },
    {
        timestamps:{
            createdAt:true,
            updatedAt:false
        }
    }
);

module.exports = mongoose.model('Document', documentSchema);