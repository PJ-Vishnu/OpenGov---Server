import mongoose from "mongoose"

export const connectMongoDB = () => {
    mongoose.connect(process.env.MONGODB_URL).then((result) => {
        console.log(`mongodb connected on host : ${result.connection.host}`);
        console.log(`mongodb connected databse : ${result.connection.name}`);
    }).catch((err) => {
        console.log(err);
    })
}