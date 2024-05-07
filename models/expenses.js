import mongoose from "mongoose";
const expenses = new mongoose.Schema({
    project_id:{
        type:mongoose.Types.ObjectId
    },
    contractorID:{
        type:mongoose.Types.ObjectId
    },
    expenseCategory:{
        type:mongoose.Types.ObjectId
    },
    expenseAmount:{
        type:mongoose.Types.ObjectId
    },
    date:{
        type:Date
    },
    description:{
        type:String
    },
    reciptDocuments:{
        type:String
    },
})