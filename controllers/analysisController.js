const { analyzeTranscript } = require("../services/analysisService");
const prisma = require("../config/prisma"); 
const analyzeCall = async (req, res, next) => {
    try {
        const callId = parseInt(req.params.id);
        const userId = req.user.id;

        const analysis = await analyzeTranscript(callId, userId);

        res.status(200).json({
            message: "Call analyzed successfully",
            analysis: analysis,
        });

    } catch (error) {
        next(error);
    }
};


const getAnalysis = async (req,res,next)=>{
    try{
        const callId = Number(req.params.id);
        const userId = req.user.id;

        const analysis = await prisma.callAnalysis.findFirst({
            where:{
                callId : callId,
                call:{
                    userId :userId,
                },
            },
        });
        if(!analysis){
            const error = new Error("Analysis not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            analysis :analysis,
        });
    }
    catch(error){
        next(error);
    }
};
module.exports = {
    analyzeCall,
    getAnalysis,
};