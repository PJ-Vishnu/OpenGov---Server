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
    let { id } = req.params
    try {
        // Check if the provided ID is a contract ID
        const contract = await Contract.findById(id);

        if (!contract) {

            // If not a contract ID, check if it's a project ID associated with a contract
            const associatedContract = await Contract.findOne({ projectId: id });
            const projectData = await Project.findById(id)
            const projectDescription = projectData.projectDescription
            if (!associatedContract) {
                return res.status(404).json({ message: 'Invalid ID. Neither a contract nor a project associated with a contract found.' });
            }

            // If a project ID associated with a contract found, use the associated contract ID
            id = associatedContract._id;
            try {
                const project = await Contract.findOne({ _id: id });
                return res.status(200).json({ result: project, projectDescription });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Internal server error" });
            }
        }
    } catch (error) {
        console.error('Error checking ID:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }


});

router.get('/viewProjectCompany/:id', async (req, res) => {
    const { id } = req.params
    try {
        const project = await Contract.findOne({ _id: id });
        return res.status(200).json({ result: project });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.get('/allProjects', async (req, res) => {
    try {
        const allOurProjects = await Contract.find();
        return res.status(200).json({ result: allOurProjects });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.put('/updateContractData/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const contract = await Contract.findById(id);

        if (!contract) {
            return res.status(404).json({ success: false, message: 'Contract not found' });
        }

        const tender = await Tender.findById(contract.tenderId);

        if (!tender) {
            return res.status(404).json({ success: false, message: 'Tender not found' });
        }

        // Update tender estimate
        tender.tenderEstimate = req.body.tenderEstimate;
        // Update estimate file if provided
        if (req.file) {
            tender.estimateFile = req.file.path;
        }

        const updatedTender = await tender.save();

        // Update contract tender estimate
        contract.tenderEstimate = req.body.tenderEstimate;
        // Update estimate file if provided
        if (req.file) {
            contract.estimateFile = req.file.path;
        }

        await contract.save();

        return res.status(200).json({ success: true, data: updatedTender, message: 'Tender estimate updated successfully' });
    } catch (error) {
        console.error('Error updating tender estimate:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


export default router
