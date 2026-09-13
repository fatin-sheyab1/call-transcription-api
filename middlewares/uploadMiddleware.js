const multer = require('multer');
//تستقبل الملفاات 

const path = require('path');
// مكان تخزين الملف ونتعامل مع اسمه وهيك 

const storage = multer.diskStorage({
    destination :(req,file,cb)=>{
        cb(null,"uploads/");
    },
    filename:(req,file,cb)=>{
        const uniqeName = Date.now()+ "-" + file.originalname;
        cb(null,uniqeName);
    },
});


const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/x-wav",
        "audio/wave",
        "audio/vnd.wave",
        "audio/mp4",
        "audio/m4a",
    ];

    const allowedExtensions = [
        ".mp3",
        ".wav",
        ".m4a",
        ".mp4",
    ];

    const extension = path.extname(file.originalname).toLowerCase();

    if (
        allowedTypes.includes(file.mimetype) ||
        allowedExtensions.includes(extension)
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only audio files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits:{
        fileSize :100 *1024 * 1024,
    },
});

module.exports = upload;