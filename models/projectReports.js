import mongoose from "mongoose";
const project_Reports = new mongoose.Schema({
    projectID:{
        type:mongoose.Types.ObjectId
    },
    date:{
        type:Date
    },
    expense_id:{
        type:mongoose.Types.ObjectId
    },
    progress_Acheived:{
        type:String
    },
    report_Documents:{
        type:String
    }
})