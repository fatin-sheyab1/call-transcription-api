const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { analyzePii } = require("../controllers/piiController");

const {
    uploadCall,
    getCalls,
    getCall,
    processCall,
    getTranscript,
    deleteCall,
} = require("../controllers/callController");


const { analyzeCall ,getAnalysis} = require("../controllers/analysisController");
const router = express.Router();

router.post("/",authMiddleware,upload.single("audio"),uploadCall);

router.get("/", authMiddleware, getCalls);
router.get("/:id", authMiddleware, getCall);

router.post("/:id/process",authMiddleware,processCall);


router.get("/:id/transcript", authMiddleware, getTranscript);
router.delete("/:id", authMiddleware, deleteCall);

router.post("/:id/analyze", authMiddleware, analyzeCall);

router.post("/:id/analyze-pii", authMiddleware, analyzePii);
router.get("/:id/analysis", authMiddleware, getAnalysis);

module.exports = router;

