const { CallStatus } = require("@prisma/client");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

require("dotenv").config();

const {
    Worker,
    createPostgresBackend
} = require("bullmq");

const prisma = require("../config/prisma");

const worker = new Worker(
    "call-processing",

    async (job) => {
        try {
            const callId = job.data.callId;

            console.log("Processing call:", callId);

            await prisma.call.update({
                where: {
                    id: callId
                },
                data: {
                    status: CallStatus.TRANSCRIBING
                }
            });

            console.log("Call status changed to TRANSCRIBING");

            const call = await prisma.call.findUnique({
                where: {
                    id: callId
                }
            });

            const form = new FormData();

            form.append(
                "audio",
                fs.createReadStream(call.audioPath)
            );

            const response = await axios.post(
                "http://127.0.0.1:8001/transcribe",
                form,
                {
                    headers: form.getHeaders()
                }
            );

            const transcript = response.data.transcript;

            const updatedCall = await prisma.call.update({
                where: {
                    id: callId
                },
                data: {
                    transcript: transcript,
                    status: CallStatus.TRANSCRIBED
                }
            });

            console.log("Call transcribed successfully");
            console.log("Final status:", updatedCall.status);

        } catch (error) {
            console.error("Worker error:", error.message);
            try{
                await prisma.call.update({
                    where:{
                        id:job.data.callId
                    },
                    data:{
                        status:CallStatus.FAILED
                    }
                });
                console.log("Call status changed to FAILED");
            }catch(updateError){
                console.error("Failed to update call status to FAILED:", updateError.message);
            }
            throw error;
        }
    },

    {
        connection: process.env.DATABASE_URL
    },

    createPostgresBackend
);

console.log("Transcription worker is running");