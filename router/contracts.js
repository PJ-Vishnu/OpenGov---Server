import express from "express";
import { Contract } from "../models/contracts.js";
import { Tender } from "../models/tender.js";
import { Project } from "../models/projects.js";
import { User } from "../models/user.js";

const router = express.Router()

router.post('/approveTender/:id', async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    try {
        const tender = await Tender.findById(id);

        if (!tender) {
            return res.status(404).json({ success: false, message: 'Tender not found' });
        }

        const project = await Project.findOne({ _id: tender.projectId });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check if a contract already exists for the project
        const existingContract = await Contract.findOne({ projectId: tender.projectId });

        if (existingContract) {
            return res.status(400).json({ success: false, message: 'A contract already exists for this project' });
        }

        const company = await User.findOne({ _id: tender.companyId });

        const tenderDetails = {
            tenderId: tender._id,
            projectId: tender.projectId,
            projectName: project.projectName,
            status: project.status,
            location: project.location,
            companyId: tender.companyId,
            companyName: company.username,
            budget: project.budget,
            proposedBudget: tender.totalBudget,
            projectEndDate: project.projectEndDate,
            tenderEstimate: tender.tenderEstimate,
            requestLetter: tender.requestLetter,
            estimateFile: tender.estimateFile // Include file path in response
        };

        console.log(tenderDetails);

        const newContract = new Contract(tenderDetails);
        console.log(newContract);
        const savedContract = await newContract.save();

        // Update project status to 'contracted'
        project.status = 'contracted';
        await project.save();

        return res.status(201).json({ success: true, data: savedContract, message: "Tender Approved successfully" });
    } catch (error) {
        console.error('Error fetching tender details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



router.get('/ourProjects/:id', async (req, res) => {
    const { id } = req.params
    try {
        const allOurProjects = await Contract.find({ companyId: id });
        return res.status(200).json({ result: allOurProjects });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/viewProject/:id', async (req, res) => {
    const { id } = req.params
    try {
        const project = await Contract.findOne({ _id: id });
        return res.status(200).json({ result: project });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/projectOrContract/:projectId', async (req, res) => {
    const { projectId } = req.params;

    try {
        // Check if the project exists and if it's currently tendering
        const project = await Project.findOne({ _id: projectId, status: 'tendering' });
        console.log(project);
        if (project) {
            // If the project is tendering, send project data to frontend
            return res.status(200).json({ result: project });
        } else {
            // If the project is not tendering, check if there's a contract for it
            const contract = await Contract.findOne({ projectId });

            if (contract) {
                // If a contract exists for the project, send contract data to frontend
                return res.status(200).json({ result: contract });
            } else {
                // If neither project nor contract found, send appropriate message
                return res.status(404).json({ message: "No project or contract found for the given ID" });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router
