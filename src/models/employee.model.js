const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
    {
        employeeCode: {
            type: String,
            required: [true, 'Employee code is required'],
            unique: true,
            uppercase: true,
            trim: true,
            match:[/^EMP\d{4}$/,'Format to be followed: [EMPxxxx]']
        },

        firstName:{
            type:String,
            required: [true, 'First Name is required'],
            trim: true,
            minlength: [2,'First name should have at least 2 characters'],
            maxlength: [50,"First name shouldn't have more than 50 characters"]
        },

        lastName: {
            type:String,
            required: [true,'Last Name is required'],
            trim: true,
            minlength: [1,'Last name should have at least 1 characters'],
            maxlength: [50,"Last name shouldn't have more than 50 characters"]
        },

        email: {
            type: String,
            required:[true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/,'Please provide a valid email address']
        },

        phone:{
            type: String,
            trim: true,
            validate:{
                validator: function(value){
                    return!value || /^d{10}$/.test(value);
                },
                message:'Phone number must be exactly 10 digits'
            }
        },

        department:{
            type: String,
            required:[true,'Department is required'],
            enum:{
                values:['Engineering','HR','Finance','Sales','Operations'],
                message:'Invalid department'
            }
        },
        designation:{
            type:String,
            required:[true,'Designation is required'],
            trim: true
        },
        salary:{
            type:Number,
            required: [true,'Salary is required'],
            min:[0,'Salary should be non-negative']
        },

        dateOfJoining:{
            type:Date,
            required:[true,'Date of joining is required'],
            validate: {
                validator: function (value) {
                    if (!value) return true;

                    const today = new Date();
                    today.setHours(23, 59, 59, 999);

                    return value <= today;
                },
                message: 'Date of joining cannot be a future date'
            }
        },

        address:{
            type: new mongoose.Schema(
                {
                    city:{
                        type:String,
                        trim:true
                    },

                    state:{
                        type:String,
                        trim:true
                    },

                    pincode:{
                        type:String,
                        validate:{
                            validator: function(value){
                                return !value || /^\d{6}$/.test(value)
                            },
                            message: 'Pincode must be 6 Digits exactly'
                        }
                    }
                },
                {_id: false}
            ),
            required: false
        },
        isActive:{
            type:Boolean,
            default: true
        }
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model('Employee', employeeSchema);