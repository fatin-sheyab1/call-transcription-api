const callService = require("../services/callService");

const uploadCall = async(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({
                message : "Audio file is required",
            });
        }
        const userId = req.user.userId;

        const call = await callService.createCall({

            originalFileName:req.file.originalname,
            audioPath:req.file.path,
            userId,
        });
        return res.status(201).json({
            message:"call uploaded successfully",
            call,
        });
    }
    catch(error){
        return res.status(500).json({
            message:"Internal Server Error",
        });
    }
};
const getCalls = async (req, res) => {
    try {
        const userId = req.user.userId;

        const calls = await callService.getCallsByUserId(userId);

        return res.status(200).json({
            calls,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const getCall = async (req, res) => {
    try {
        const callId = Number(req.params.id);
        const userId = req.user.userId;

        const call = await callService.getCallById(callId, userId);

        if (!call) {
            return res.status(404).json({
                message: "Call not found",
            });
        }

        return res.status(200).json({
            call,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};


const processCall = async(req,res)=>{
    try {
        const callId = Number(req.params.id);
        const userId = req.user.userId;

        const result = await callService.processCall(callId ,userId);
        return res.status(202).json(result);
    }
    catch(error){
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to process call"
        });
    }
};

const getTranscript = async(req,res)=>{
    try{
        const callId = Number(req.params.id);
        const userId = req.user.userId;

        const call = await callService.getTranscriptByCallId(callId,userId);
        if(!call){
            return res.status(404).json({
                message:"Call Not Found ",
            });
        }
        return res.status(200).json({
            callId :call.id,
            transcript :call.transcript,
            status:call.status,
        });
    }
    catch(error){
        return res.status(500).json({
            message:"Internal server error",
        });
    }
};
const deleteCall = async (req, res) => {
    try {
        const callId = Number(req.params.id);
        const userId = req.user.userId;

        const result = await callService.deleteCall(callId, userId);

        return res.status(200).json(result);

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to delete Call"
        });
    }
};



module.exports={
    uploadCall,
    getCalls,
    getCall,
    processCall,
    getTranscript,
    deleteCall,
   
};