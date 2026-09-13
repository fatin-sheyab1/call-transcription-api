const { extractPiiFromCall } = require("../services/piiService");const analyzePii = async(req,res,next) =>{
    try{
        const callId = Number(req.params.id);
        const userId = req.user.id;

        const result = await extractPiiFromCall(callId, userId);
        res.status(200).json({
            message :"PII extraction successful",
            pii : result
        });
    }
    catch(error){
        next(error);
    }
};
module.exports = {
    analyzePii,
};