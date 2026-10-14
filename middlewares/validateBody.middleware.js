exports.validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                error: "Validation failed",
                details: result.error.issues.map((issue)=> issue.message),
            }); 
        }
        req.body = result.data;
        next();
    } 
}