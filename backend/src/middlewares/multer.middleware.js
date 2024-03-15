import multer from "multer";

//Storing file in disk
const storage = multer.diskStorage({
    //destination of file
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    //filename
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  //exporting the middleware
  export const upload = multer({ storage: storage })