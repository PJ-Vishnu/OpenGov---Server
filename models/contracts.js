import mongoose from "mongoose";
const contractSchema = new mongoose.Schema({
    tenderId: {
        type: String
    },
    projectId: {
        type: String,

    },
    projectName: {
        type: String
    },
    companyId: {
        type: String,

    },
    companyName: {
        type: String
    },
    requestLetter: {
        type: String,
    },

    tenderEstimate: {
        type: Array, // Assuming tender estimate is an array of objects
    },
    budget: {
        type: Number,

    },
    proposedBudget: {
        type: Number,

    },
    estimateFile: {
        type: String, // Assuming you store the file path as a string
        default: null // or whatever default value suits your needs
    },
    projectEndDate: {
        type: Date
    },
    projectReport: {
        type: String
    }
})
const Contract = mongoose.model('contract', contractSchema)
export { Contract };