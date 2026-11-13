const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

const Employee = require('../models/employee.model');
const Document = require('../models/document.model');

const allowedFields=[
    'employeeCode',
    'fristName',
    'lastName',
    'email',
    'phone',
    'department',
    'designation',
    'salary',
    'dateOfJoining',
    'address',
    'isActive'
];

const requiredFields =[
    'employeeCode',
    'fristName',
    'lastName',
    'email',
    'phone',
    'department',
    'designation',
    'salary',
    'dateOfJoining'
];

const allowedSortFields =[
    ...allowedFields,
    'createdAt',
    'updatedAt'
];

const pickAllowedFields = (body)=>{
    const result={};

    for(const field of allowedFields){
        if(Object.prototype.hasOwnProperty.call(body,field)){
            result[field]=body[field];
        }
    }

    return result;
};

const isValidBody = (body)=>{
    return(
        body !== null && typeof body ==='object' && !Array.isArray(body)
    );
};

const isValidId = (id) => {
    return mongoose.isValidObjectId(id);
};

const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getValidationErrors = (error)=>{
    return Object.values(error.errors).map((item)=>({
        field: item.path,
        message:item.message
    }));
};


exports.createEmployee = async(req,res,next)=>{
    try{
        if(!isValidBody(req.body)){
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON object',
                errors:[]
            });
        }
        const employeeData = pickAllowedFields(req.body);
        const employee = new Employee(employeeData);
        await employee.save();

        return res.status(201).json({
            success: true,
            message:'Employee created',
            data: employee
        });
    } catch(error){
        next(error);
    }
};

exports.getEmployees = async(req,res,next) => {
    try{
        let page = Number(req.query.page ?? 1);
        let limit = Number(req.query.limit ?? 10);
        
        if(
            !Number.isInteger(page) ||
            !Number.isInteger(limit) ||
            page < 1 ||
            limit < 1
        ){
            return res.status(400).json({
                success: false,
                message: 'page and limit must be positive integers'
            });
        }

        limit = Math.min(limit,50);

        const filter = {};

        if(req.query.search){
            const searchRegex = new RegExp(
                escapeRegex(String(req.query.search)),
                'i'
            );

            filter.$or = [
                {firstName: searchRegex},
                {lastName: searchRegex},
                {email: searchRegex},
                {employeeCode: searchRegex}
            ];
        }

        if (req.query.deaprtment){
            filter.department = req.query.department;
        }

        if(req.query.isActive !== undefined){
            if(!['true','false'].includes(req.query.isActive)){
                return res.status(400).json({
                    success: false,
                    message:'isAcive must be true or false'
                });
            }
            filter.isActive = req.query.isActive
        }

        const sortQuery = req.query.sort || '-createdAt';
        const descending = sortQuery.startWith('-');
        const sortField = descneding? sortQuery.substring(1):sortQuery;

        if(!allowedSortFields.includes(sortField)){
            return res.status(400).json({
                success: false,
                message: 'Invalid sort field',
                errors:[
                    {
                        field:"sort",
                        message:`Sorting by ${sortField} is not allowed`
                    }
                ]
            });
        }

        const sort = {
            [sortField]: descending ? -1:1
        };

        const skip = (page - 1) * limit;
        const [employees, total] = await promise.all([
            Employee.find(filter).sort(sort).skip(skip).limit(limit),
            Employee.countDocuments(filter)
        ]);

        return res.status(200).json({
            success:true,
            data:employees,
            meta: {
                page,limit,total,totalPages: Math.ceil(total/limit)
            }
        });
    } catch(error){
        next(error);
    }
};

exports.getEmployeeById = async(req,res,next) =>{
    try{
        const { id } = req.params;

        if(!isValidId(id)){
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            });
        }

        const employee = await Employee.findById(id);
         if(!employee){
            return res.status(404).json({
                success: true,
                message: 'Employee not found'
            });
         }

         const documentCount = await document.countDocuments({
            employee: employee._id
         });

         return res.status(200).json({
            success: true,
            message: ' Employee retrieval successful',
            data: {
                employee,
                documentCount
            }
         });
    } catch(error){
        next(error);
    }
};

exports.updateEmployee = async (req,res,next)=>{
    try{
        const { id } = req.params;
        if(!isValidId(id)){
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            });
        }
        if (!isValidBody(req.body)) {
            return res.status(400).json({
                success: false,
                message: 'Request body must be a valid JSON object',
                errors: []
            });
        }
         if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const employeeData = pickAllowedFields(req.body);
        const missingFields = requiredFields.filter((field)=> !Object.prototype.hasOwnProperty.call(employeeData, field));

        if(missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message:"All required fields must be provided for PUT",
                errors: missingFields.map((fields)=>({
                    field,
                    message:`${field} is required`
                }))
            });
        }

        for (const field of allowedFiels){
            if(field === 'isActive'&& !Object.prototype.hasOwnProperty.call(employeeData,field)){
                employee.isActive = true;
            } else if(Object.prototype.hasOwnProperty.call(employeeData, field)){
                employee[field] = employeeData[field];
            }else if (field === 'phone' || field === 'address'){
                employee[field]= undefined;
            }
        }

        await employee.save();

        return res.status(200).json({
            success: true,
            message:'Employee information updated successfully',
            data: employee
        });
    }catch (error){
        next(error);
    }
};

exports.patchEmployee=async(req,res,next)=>
{
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            });
        }

        if (!isValidBody(req.body)) {
            return res.status(400).json({
                success: false,
                message: 'Request body must be a valid JSON object',
                errors: []
            });
        }

        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const employeeData = pickAllowedFields(req.body);

        if(Object.keys(employeeData).length === 0){
            return res.status(400).json({
                success: false,
                message:"At least one valid employee field must be provided"
            });
        }

        for (const [field, value] of Object.entries(employeeData)){
            if ( field === 'address' && value && typeof value === 'object' && !Array.isArray(value)){
                employee.address = {
                    ...(employee.address?.toObject?.()|| employee.address || {}),
                    ...value
                };
            }else {
                employee[field] = value;
            }
        }

        await employee.save();

        return res.status(200).json({
            success: true,
            message:' employee updation successfully',
            data: employee
        });
    }catch (error){
        next(error);
    }
};

exports.deleteEmployee = async(req,res,next)=>{
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            });
        }

        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        const documents = await Document.find({
            employee: employee._id
        });

        const projectRoot = path.resolve(__dirname,'../../');
        const uploadsRoot = path.resolve(projectRoot,'uploads');
        const filePaths = new Set();

        for(const document of documents){
            if(!document.path) continue;

            const absolutePath = path.resolve(projectRoot, document.path);
            const relativePath = path.relative(uploadsRoot,absolutePath);

            const isInsideUploads = relativePath !== '' && !relativePath.startWith('..')&&!path.isAbsolute(relativePath);

            if(!isInsideUploads){
                return res.status(500).json({
                    success: false,
                    message: 'A document contains an invalid upload path. Deletion was interrupted'
                });
            }

            filePaths.add(absolutePath);
        }

        for(const filePath of filePath){
            try{
                await fs.unlink(filePath);
            } catch (error){
                if(error.code !== 'ENOENT'){
                    throw error;
                }
            }
        }
        await Document.deleteMany({
            employee: employee._id
        });

        await employee.deleteOne();

        return res.status(200).json({
            success: true,
            message: ' Employee and related documents have been deleted',
            data:{
                employeeId: employee._id,
                documentsDeleted: documents.length
            }
        });

    }catch(error){
        next(error);
    }
};