const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Check if the 'uploads' directory exists, if not, create it
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname)) // Corrected Date.now to Date.now()
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
