const fs = require('fs/promises');
const path = require('path');
const { parse } = require('csv-parse/sync');

const Employee = require('../models/employee.model');
const Document = require('../models/document.model');

const projectRoot = path.resolve(__dirname, '../../');
const uploadsRoot = path.resolve(projectRoot, 'uploads');

const getSafeFilePath = (document) =>{
    const absolutePath = path.resolve(projectRoot, document.path);
    const relativePath = path.relative(uploadsRoot, absolutePath);

    if(!relativePath || relativePath.startsWith('..')||path.isAbsolute(relativePath)){
        throw new Error('Invalid document storage path');
    }

    return absolutePath;
};

const removeFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
};

const ensureFileExists = async (filePath, res) => {
    try {
        await fs.access(filePath);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({
                success: false,
                message: 'Document record exists, but the file is missing from server storage'
            });
            return false;
        }
        throw error;
    }
};

exports.ensureEmployeeExists = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        req.employee = employee;
        next();
    } catch (error) {
        next(error);
    }
};

exports.uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a file in the document field'
            });
        }

        const file = req.file;
        const documentData = {
            employee: req.employee._id,
            originalName: path.basename(file.originalname),
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            path: path.posix.join(
                'uploads',
                String(req.employee._id),
                file.filename
            ),
            category: req.body.category || 'OTHER'
        };

        try {
            const document = await Document.create(documentData);

            return res.status(201).json({
                success: true,
                message: 'Document uploaded successfully',
                data: document
            });
        } catch (error) {
            await removeFile(file.path);
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

exports.uploadBulkDocuments = async (req, res, next) => {
    const savedDocuments = [];
    const uploadedFiles = req.files || [];

    try {
        if (uploadedFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide files in the documents field'
            });
        }

        for (const file of uploadedFiles) {
            const document = await Document.create({
                employee: req.employee._id,
                originalName: path.basename(file.originalname),
                storedName: file.filename,
                mimeType: file.mimetype,
                size: file.size,
                path: path.posix.join(
                    'uploads',
                    String(req.employee._id),
                    file.filename
                ),
                category: req.body.category || 'OTHER'
            });

            savedDocuments.push(document);
        }

        return res.status(201).json({
            success: true,
            message: 'Documents uploaded successfully',
            data: savedDocuments
        });
    } catch (error) {
        await Promise.allSettled(
            savedDocuments.map((document)=> document.deleteOne())
        );

        await Promise.allSettled(
            uploadedFiles.map((file)=>removeFile(file.path))
        );

        next(error);
    }
};

exports.getEmployeeDocuments = async(req,res,next)=>{
    try{
        const documents = (await Document.find({employee: req.employee._id})).toSorted({createdAt:-1});

        return res.status(200).json({
            success:true,
            data: documents,
            count: documents.length
        });
    }catch(error){
        next(error);
    }
};
exports.downloadDocument = async (req,res,next)=>{
    try{
        const document = await Document.findById(req.params.docId);

        if(!document){
            return res.status(404).json({
                success: false,
                message:'Document not found'
            });
        }

        const filePath = getSafeFilePath(document);

        if(!(await ensureFileExists(filePath,res)))return;

        res.setHeader(
            'content-Type',
            document.mimeType || 'application/octet-stream'
        );

        return res.download(
            filePath,
            path.basename(document.originalName),
            (error)=>{
                if(error && !res.headerSent) next(error);
            }
        );
    }catch(error){
        next(error);
    }
};

exports.getDocumentContent = async (req,res,next)=>{
    try{
        const document = await Document.findById(req.params.docId);
       
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const extension = path.extname(document.originalName).toLowerCase();

        if (!['.txt', '.csv'].includes(extension)) {
            return res.status(415).json({
                success: false,
                message: 'Content preview is supported only for .txt and .csv files'
            });
        }

        const filePath = getSafeFilePath(document);

        if (!(await ensureFileExists(filePath, res))) return;

        const content = await fs.readFile(filePath, 'utf8');

        if (extension === '.txt') {
            const lines = content.length === 0
                ? []
                : content.split(/\r\n|\n|\r/);

            const words = content.match(/[\p{L}\p{N}_]+/gu) || [];

            return res.status(200).json({
                success: true,
                data: {
                    documentId: document._id,
                    content,
                    lineCount: lines.length,
                    wordCount: words.length
                }
            });
        }

        const rows = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true
        });

        return res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                rows,
                rowCount: rows.length
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteDocument = async(req,res,next)=>{
    try{
        const document = await Document.findById(req.params.docId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const filePath = getSafeFilePath(document);

        if (!(await ensureFileExists(filePath, res))) return;

        await fs.unlink(filePath);
        await document.deleteOne();

        return res.status(200).json({
            success: true,
            message:' document and file deletion successful',
            data:{ documentId: document._id}
        });
    }catch(error){
        next(error);
    }
};