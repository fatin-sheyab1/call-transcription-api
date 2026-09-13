const prisma = require("../config/prisma");
const ai = require("../config/gemini");

const analyzeTranscript = async (callId, userId) => {
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

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",

        contents: `
Analyze the following call transcript.

Generate:
- a concise summary
- the overall sentiment: positive, negative, or neutral
- the main topics discussed

Transcript:
${call.transcript}
`,

        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
                    summary: {
                        type: "string",
                    },
                    sentiment: {
                        type: "string",
                        enum: ["positive", "negative", "neutral"],
                    },
                    keyTopics: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                },
                required: ["summary", "sentiment", "keyTopics"],
            },
        },
    });

    const analysis = JSON.parse(response.text);
    if(
        !analysis.summary ||
        !["positive","negative","neutral"].includes(analysis.sentiment) ||
        !Array.isArray(analysis.keyTopics)

    ){
        const error = new Error("Invalid analysis response");
        error.statusCode = 502;
        throw error;
    }

    const savedAnalysis = await prisma.callAnalysis.upsert({
        where: {
            callId: callId,
        },
        update: {
            summary: analysis.summary,
            sentiment: analysis.sentiment,
            keyTopics: analysis.keyTopics,
        },
        create: {
            summary: analysis.summary,
            sentiment: analysis.sentiment,
            keyTopics: analysis.keyTopics,
            callId: callId,
        },
    });

    return savedAnalysis;
};

module.exports = {
    analyzeTranscript,
};