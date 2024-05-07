import express from 'express';
import multer from 'multer';
import { Tender } from '../models/tender.js';
import { upload } from '../utils/multer.js';
import { Project } from '../models/projects.js';
import { User } from '../models/user.js';
import mongoose from 'mongoose';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/TenderEstimates');
  },
  filename: function (req, file, cb) {
    // Generate a random unique identifier
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // Append the unique identifier to the original filename
    cb(null, uniquePrefix+'-'+file.originalname);
  }
});


const uploadTender = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
      // Check file type
      if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
          return cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
      }
      cb(null, true);
  }
});

router.use('/uploads', express.static('uploads'));

router.post("/createTender", uploadTender.single('estimateFile'), async (req, res) => {
  try {
      const { projectId, companyId, requestLetter, tenderEstimate, totalBudget } = req.body;

      const newTender = new Tender({
          projectId,
          companyId,
          requestLetter,
          tenderEstimate: JSON.parse(tenderEstimate),
          totalBudget,
          estimateFile: req.file ? req.file.path : null
      });

      const savedTender = await newTender.save();

      return res.status(201).json({ success: true, data: savedTender, message: "Tender created successfully" });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// Route for fetching tender details by ID
router.get('/tenderDetails/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tender = await Tender.findById(id);

    if (!tender) {
      return res.status(404).json({ success: false, message: 'Tender not found' });
    }

    const project = await Project.findOne({ _id: tender.projectId });
    const company = await User.findOne({ _id: tender.companyId });

    const tenderDetails = {
      _id: tender._id,
      projectId: tender.projectId,
      projectName: project.projectName,
      companyId: tender.companyId,
      companyName: company.username,
      budget: project.budget,
      proposedBudget: tender.totalBudget,
      tenderingDate: project.tenderingLastDate,
      tenderEstimate: tender.tenderEstimate,
      requestLetter: tender.requestLetter,
      estimateFile: tender.estimateFile // Include file path in response
    };

    res.json({ success: true, data: tenderDetails });
  } catch (error) {
    console.error('Error fetching tender details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Route for deleting a tender by ID
router.delete('/deleteTender/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTender = await Tender.findByIdAndDelete(id);

    if (!deletedTender) {
      return res.status(404).json({ success: false, message: 'Tender not found' });
    }

    res.status(200).json({ success: true, message: 'Tender deleted successfully' });
  } catch (error) {
    console.error('Error deleting tender:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Route for fetching all tenders for a project by project ID
router.get('/projectTenders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tenders = await Tender.find({ projectId: id });

    if (tenders.length === 0) {
      return res.status(404).json({ success: false, message: 'Tender details not found for the given project ID' });
    }

    const tenderDetails = await Promise.all(tenders.map(async tender => {
      const project = await Project.findOne({ _id: tender.projectId });
      const company = await User.findOne({ _id: tender.companyId });

      return {
        _id: tender._id,
        projectId: tender.projectId,
        projectName: project.projectName,
        companyId: tender.companyId,
        companyName: company.username,
        location: project.location,
        budget: tender.totalBudget,
        tenderingDate: project.tenderingLastDate
      };
    }));

    res.json({ success: true, data: tenderDetails });
  } catch (error) {
    console.error('Error fetching tender details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
