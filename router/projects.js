import express from "express";
import { Project } from "../models/projects.js";
import { Contract } from "../models/contracts.js";
import { ReqProject } from "../models/projectRequests.js";

const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

router.post("/newProject", async (req, res) => {
  try {
    // Set default value for status
    const projectData = { ...req.body, status: "tendering" };
    
    const newProject = new Project(projectData);
    const savedProject = await newProject.save();
    return res.status(201).json({ result: savedProject, message: "Project Created" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/updateProject/:id", async (req, res) => {
    try {
        const { id } = req.params; // Correct usage of req.params
        const updateProject = await Project.findOne({ _id: id });
        if (!updateProject) {
            return res.status(404).json({ error: "Project not found" }); // Respond with 404 if Project is not found
        }
        return res.status(200).json({ result: updateProject }); // Respond with Project data
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" }); // Handle errors properly
    }
});

router.put("/updateProject/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const updateProject = req.body;
      const updatedProject = await Project.findByIdAndUpdate(id, updateProject, { new: true });

      if (!updatedProject) {
          return res.status(404).json({ error: "Project not found" });
      }

      return res.status(200).json({ result: updatedProject, message: "Project updated successfully" });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/deleteProject/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const deletedProject = await Project.findByIdAndDelete(projectId);
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const allProjects = await Project.find();
    return res.status(200).json({ result: allProjects });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/viewProject/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const thisProject = await Project.findOne({ _id: id }); // Corrected: findOne needs an object with query parameters
    if (!thisProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json({ result: thisProject });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/type/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
      // Check if the project exists and if it's currently tendering
      const project = await Project.findOne({ _id: projectId });
      
      if (project) {
          // If the project is tendering, send "tendering" as a response
          if (project.status === 'tendering') {
              return res.status(200).json({ type: 'tendering' });
          } else if (project.status === 'contracted') {
              // If the project is contracted, send "contracted" as a response
              return res.status(200).json({ type: 'contracted' });
          }
      }

      // If neither project nor contract found, send appropriate message
      return res.status(404).json({ message: "No project or contract found for the given ID" });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/count", async (req, res) => {
  try {
      const totalProjectsCount = await Project.countDocuments();
      const contractedProjectsCount = await Project.countDocuments({ status: "contracted" });
      const tenderingProjectsCount = await Project.countDocuments({ status: "tendering" });
      const requestedProjectsCount = await ReqProject.countDocuments();
      return res.status(200).json({
          totalProjects: totalProjectsCount,
          contractedProjects: contractedProjectsCount,
          tenderingProjects: tenderingProjectsCount,
          requestedProjects: requestedProjectsCount
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
