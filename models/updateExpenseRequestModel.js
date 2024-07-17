
// updateExpenseRequestModel.js

import mongoose from 'mongoose';

const updateExpenseRequestSchema = new mongoose.Schema({
    contractId: {
        type: String,

    },
    requestLetter: {
        type: String,

    },
    newTenderEstimate: {
        type: String,

    },
    expenditure: {
        type: [{ name: String, amount: Number }],
   
    },
    file: {
        type: String, // Assuming you store the file path as a string
        default: null // or whatever default value suits your needs
    }
});

const UpdateExpenseRequest = mongoose.model('UpdateExpenseRequest', updateExpenseRequestSchema);

export { UpdateExpenseRequest };
