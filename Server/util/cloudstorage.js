import { Storage } from '@google-cloud/storage'
import multer from 'multer'

/** These resources helped extensively in getting this to work.
 * credits: 
 * https://www.bezkoder.com/google-cloud-storage-nodejs-upload-file/ 
 * https://www.youtube.com/watch?v=pGSzMfKBV9Q
 */

const BUCKET_NAME = process.env.GCS_BUCKET_NAME
const FILE_SIZE_LIMIT = 5 * 1024 * 1024 // 5 mb

// make the gcloud storage object
const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFileName: '../storage-service-key.json'
})

// make the multer processor
export const uploadMulter = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: FILE_SIZE_LIMIT }
})

const bucket = storage.bucket(BUCKET_NAME)

export const uploadGCS = (file) => {
    return new Promise((resolve, reject) => {
        const filename = `${Date.now()}-${file.originalname}`

        const blob = bucket.file(filename)

        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: file.mimetype
            }
        });

        // if we error at any point, send error message as promise rejection
        blobStream.on('error', (err) => {
            reject(err)
        });

        blobStream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`
            resolve(publicUrl)
        });

        // put file buffer from multer into gcs stream
        blobStream.end(file.buffer)
    });
}
