import mongoose, { Types } from "mongoose";
const projectRequests=new mongoose.Schema({
    shortDescription: {
        type: String,
        required: true
      },
      detailedDescription: {
        type: String,
        required: true
      },
      location: {
         type: Array        
      },
      files: [String] 
})
export const ReqProject = mongoose.model('ReqProject', projectRequests)