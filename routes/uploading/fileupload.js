const multer = require('multer')
const path = require('path')


const storage = multer.memoryStorage({
     destination: function (req, file, cb) {
          cb (null,'./upload')
     },
     filename: function (req, file, cb) {
          cb(null, Date.now() + '_' + file.originalname)
     }
})

const upload = multer({
     storage:storage
})
 
module.exports = upload;
