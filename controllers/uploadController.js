const multer = require('multer')
const uploadController = require('express').Router()

//destination: the directory in which the image will be saved
//filename: what will be the name of the saved image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, req.body.filename)
    }
})

const upload = multer({
    storage
})

//upload.single("image1") is going to check in the req.body for the req.body.image1
//both "image1" name must be same
uploadController.post('/image', upload.single("image"), async(req, res) => {
    try {
        return res.status(200).json("File uploaded successfully!")
    } catch (error) {
        console.error(error)
    }
})

module.exports = uploadController