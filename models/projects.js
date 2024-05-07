import mongoose from "mongoose";
const projectSchema = new mongoose.Schema({
    projectName: {
        type: String
    },
    projectDescription: {
        type: String
    },
    location: {
        type: String
    },
    locationMapURL: {
        type: String
    },
    type: {
        type: String
    },
    budget: {
        type: Number
    },
    initiator: {
        type: String
    },
    status: {
        type: String
    },
    companyID: {
        type: mongoose.Types.ObjectId
    },
    tenderingLastDate: {
        type: Date
    },
    projectEndDate:{
        type: Date
    },
    projectDocuments: { // create model
        type: String
    },
    projectMedia: {
        type: String 
    },

})
export const Project = mongoose.model('Projects', projectSchema)