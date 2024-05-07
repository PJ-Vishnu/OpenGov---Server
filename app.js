import express from "express"
import dotenv from "dotenv";

// cors configuration
import cors from "cors"

// mongodb connection
import { connectMongoDB } from "./db/database.js"

// import routers
import userRegister from "./router/user.js"
import authRouter from "./router/auth.js"
import projectRouter from "./router/projects.js"
import tenderRouter from "./router/tenders.js"
import contractRouter from './router/contracts.js'

const app = express()

app.use(express.static('uploads'))
// env configuration
dotenv.config()

// config json 
app.use(express.json())
app.use(cors())

// route for user ,company registration api
app.use('/register', userRegister)
app.use('/auth', authRouter)
app.use('/projects', projectRouter)
app.use('/tenders', tenderRouter)
app.use('/contracts', contractRouter)


//uploaded files
app.use('/uploads', express.static('uploads'));



// test api
app.get('/test',(req,res)=>{
    res.json({message:'Server working!'})
})


// server listing
app.listen(process.env.PORT,()=>{
    connectMongoDB()
    console.log(`Server running on PORT : http://localhost:${process.env.PORT}`);
})