const prisma = require("../config/prisma");
const { CallStatus } = require("@prisma/client");
const callQueue = require("../queues/callQueue");
const fs = require("fs");
const createCall = async({ originalFileName ,audioPath , userId })=>{
    const call = await prisma.call.create({
        data:{
            originalFileName,
            audioPath,
            userId,
        },
    });
    return call;
};

const getCallsByUserId = async (userId) => {
    const calls = await prisma.call.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return calls;
};

const getCallById = async (callId, userId) => {
    const call = await prisma.call.findFirst({
        where: {
            id: callId,
            userId: userId,
        },
    });

    return call;
};

const processCall = async (callId,userId)=>{
    const call = await prisma.call.findFirst({
        where:{
            id:callId,
            userId:userId
        }
    });

    if(!call){
        const error = new Error("call not found");
        error.statusCode = 404;
        throw error;
    }
    
    const updateCall = await prisma.call.update({
        where:{
            id:callId
        },
        data:{
            status: CallStatus.QUEUED
        }
    });

    await callQueue.add(
        "transcribe",
        {
            callId:callId
        }
    );

    return{
        message:"Call queued for processing",
        callId:updateCall.id,
        status:updateCall.status
    };
};

const getTranscriptByCallId = async(callId,userId)=>{
    const call = await prisma.call.findFirst({
        where:{
            id:callId,
            userId:userId
        },
        select:{
            id:true,
            transcript:true,
            status:true,

        },
    });
    return call;
};

const deleteCall = async(callId,userId)=>{
    const call = await prisma.call.findFirst({
        where:{
            id:callId,
            userId:userId
        }
    });

    if(!call){
        const error = new Error("call Not Found");

        error.statusCode = 404;
        throw error;
    }
    if (fs.existsSync(call.audioPath)){
        fs.unlinkSync(call.audioPath);
    }
    await prisma.call.delete({
        where:{
        id:callId
  } 
    });
    return{
        message :"Call deleted sucessfully"
    };
};

module.exports={
    createCall,
    getCallsByUserId,
    getCallById,
    processCall,
    getTranscriptByCallId,
    deleteCall,
    
};