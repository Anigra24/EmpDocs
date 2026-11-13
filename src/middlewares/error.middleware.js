const errorHandler = (error,req,res,next) =>{
    console.error(error);

    if(error.name === 'ValidationError'){
        const errors = Object.values(error.errors).map((item)=> ({
            field: item.path,
            message: item.message
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    if(error.code === 11000){
        const field = Object.keys(error.keyPattern || {})[0] || 'field';

        return res.status(409).json({
            success: false,
            message: ` Duplicate value for ${field}`,
            errors:[
                {
                    field,
                    message:`${field} already exists`
                }
            ]
        });
    }

    if (error.name ==='CastError'){
        return res.status(400).json({
            success: false,
            message: ' Invalid value provided',
            errors:[
                {
                    field:error.path,
                    message: error.message
                }
            ]
        });
    }
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error){
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON request'
        });
    }

    return res.status(error.status || 500).json({
        success: false,
        message: error.status ? error.message : 'Internal server error'
    });
};

module.exports = errorHandler;