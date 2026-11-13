const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const allowedExtensions = [
    '.pdf',
    '.jpg',
    '.jpeg',
    '.png',
    '.txt',
    '.csv'
];

const storage = multer.diskStorage({
    destination: async (req, file, callback) => {
        try {
            const employeeFolder = path.join(
                process.cwd(),
                'uploads',
                req.params.id
            );

            await fs.mkdir(employeeFolder, { recursive: true });
            callback(null, employeeFolder);
        } catch (error) {
            callback(error);
        }
    },

    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const randomString = crypto.randomBytes(8).toString('hex');
        const storedName = `${Date.now()}-${randomString}${extension}`;

        callback(null, storedName);
    }
});

const fileFilter = (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
        const error = new Error(
            'Unsupported file type. Allowed types: PDF, JPG, JPEG, PNG, TXT and CSV.'
        );

        error.statusCode = 415;
        return callback(error);
    }

    callback(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5
    }
});

const removeUploadedFiles = async (req) => {
    const files = [
        ...(req.files || []),
        ...(req.file ? [req.file] : [])
    ];

    await Promise.allSettled(
        files.map((file) => fs.unlink(file.path))
    );
};

const runUpload = (middleware) => (req, res, next) => {
    middleware(req, res, async (error) => {
        if (error) {
            await removeUploadedFiles(req);
            return next(error);
        }

        next();
    });
};

exports.uploadSingleDocument = runUpload(
    upload.single('document')
);

exports.uploadMultipleDocuments = runUpload(
    upload.array('documents', 5)
);