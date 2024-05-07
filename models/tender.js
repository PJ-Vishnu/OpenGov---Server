// tenderModel.js

import mongoose from 'mongoose';

const tenderSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true
    },
    companyId: {
        type: String,
        required: true
    },
    requestLetter: {
        type: String,
        required: true
    },
    tenderEstimate: {
        type: Array, // Assuming tender estimate is an array of objects
        required: true
    },
    totalBudget: {
        type: Number,
        required: true
    },
    estimateFile: {
        type: String, // Assuming you store the file path as a string
        default: null // or whatever default value suits your needs
    }
});

const Tender = mongoose.model('Tender', tenderSchema);

export { Tender };

