import mongoose from 'mongoose'
const citizenReport = new mongoose.Schema({
    projectID:{
        type:mongoose.Types.ObjectId
    },
    location:{
        type:String
    },
    date:{
        type:String
    },
    discription:{
        type:String
    },
    Media:{
        type:String
    }
})