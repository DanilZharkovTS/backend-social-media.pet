import multer from 'multer'

const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 },
  fileFilter(req, file, cb) {    
    const allowed = ['image/png', 'image/jpeg', 'image/webp']
    console.log(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      req.fileValidationError = 'Invalid file format'
      cb(null, false)
    }
  },
})
