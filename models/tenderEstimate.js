import mongoose, { modelNames } from "mongoose";
const tenderEstimate= new mongoose.Schema({
    projectID:{
        type:mongoose.Types.ObjectId
    },
    dynamicForm: [
        {
          name: String,
          amount: Number
        }
      ]
    });