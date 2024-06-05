import mongoose from 'mongoose'
const reportSchema = new mongoose.Schema({
    citizenId:{
        type:mongoose.Types.ObjectId
    },
    contractId:{
        type:mongoose.Types.ObjectId
    },
    date:{
        type:String
    },
    type:{
        type:String
    },
    report:{
        type:String
    },
    files:[{
        type:String
    }]
})
const Reports = mongoose.model('reports', reportSchema)
export { Reports };