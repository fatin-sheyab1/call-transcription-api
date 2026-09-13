const axios = require("axios");
const prisma = require("../config/prisma");

const extractPiiFromCall = async (callId, userId) => {

    const call = await prisma.call.findFirst({
        where: {
            id: callId,
            userId: userId,
        },
    });

    if (!call) {
        const error = new Error("Call not found");
        error.statusCode = 404;
        throw error;
    }

    if (!call.transcript) {
        const error = new Error("Transcript is not available");
        error.statusCode = 400;
        throw error;
    }

    const response = await axios.post(
        process.env.PII_API_URL,
        {
            transcript: call.transcript,
        }
    );

    const pii = response.data.pii;
    if (
    !Array.isArray(pii) ||
    !pii.every(item =>
        item &&
        typeof item.type === "string" &&
        typeof item.value === "string"
    )
) {
    const error = new Error("Invalid PII response");
    error.statusCode = 502;
    throw error;
}


    const savedAnalysis = await prisma.callAnalysis.upsert({
        where: {
            callId: callId,
        },
        update: {
            pii: pii,
        },
        create: {
            callId: callId,
            pii: pii,
        },
    });

    return savedAnalysis.pii;
};

module.exports = {
    extractPiiFromCall,
};