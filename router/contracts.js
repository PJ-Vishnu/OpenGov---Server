import express from "express";
import { Contract } from "../models/contracts.js";
import { Tender } from "../models/tender.js";
import { Project } from "../models/projects.js";
import { User } from "../models/user.js";

const router = express.Router()

router.post('/approveTender/:id', async (req, res) => {
    const { id } = req.params
    console.log(req.body);
    try {
        const tender = await Tender.findById(id);

        if (!tender) {
            return res.status(404).json({ success: false, message: 'Tender not found' });
        }

        const project = await Project.findOne({ _id: tender.projectId });
        const company = await User.findOne({ _id: tender.companyId });

        const tenderDetails = {
            tenderId: tender._id,
            projectId: tender.projectId,
            projectName: project.projectName,
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
        const newContract = new Contract(
            tenderDetails
        )
        console.log(newContract);
        const savedContract = await newContract.save()
        return res.status(201).json({ success: true, data: savedContract, message: "Tender Approved successfully" });
    } catch (error) {
        console.error('Error fetching tender details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})


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

export default router
