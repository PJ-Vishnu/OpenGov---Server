import express, { request } from "express";
import multer from "multer";
import { ReqProject } from "../models/projectRequests.js";

const router = express.Router();

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/ProjectRequests') // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    // Generate a random unique identifier
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // Append the unique identifier to the original filename
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/requestProject', upload.array('files'), async (req, res) => {
  try {
    // Extract data from the request body
    const { shortDescription, detailedDescription, longitude, latitude } = req.body;
    const files = req.files.map(file => file.path); // Get file paths
    let location=[latitude,longitude]
    // Create a new project request instance
    const projectRequest = new ReqProject({
      shortDescription,
      detailedDescription,
      location,
      files
    });

    // Save the project request to the database
    const savedProjectRequest = await projectRequest.save();

    // Send a success response
    res.status(201).json(savedProjectRequest);
  } catch (error) {
    // Handle errors
    console.error('Error submitting project request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/showRequests', async (req,res)=>{
  try {
    const request=await ReqProject.find()
    return res.status(200).json({ result: request });
} catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
}
})

export default router;
