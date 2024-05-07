import express from "express";

// import user model
import { User } from "../models/user.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

router.post("/", async (req, res) => {

   
    const isMatch = await User.findOne({ email: req.body.email, password:req.body.password });

    console.log(isMatch,'isMatch');

    if (!isMatch) {
        const newUser = new User(req.body); 
        const savedUser = await newUser.save();
        return res.status(201).json({ result: savedUser, data:newUser, message: "User created 😊" }).end();
    } else {
        return res.status(409).json({ message: "Mail is existing!" }).end();
    }
});

router.get('/check-email/:email', async (req, res) => {
    const email = req.params.email;

    try {
        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email });

        // If email exists, return a response indicating it's in use
        if (existingUser) {
            return res.json({ exists: true });
        }

        // If email doesn't exist, return a response indicating it's not in use
        return res.json({ exists: false });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Error checking email:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post("/newuser",upload.single('avatar'), async (req, res) => {
    console.log(req.body);
    // console.log(req.files);
    // console.log(req.file.filename);

    

    try {
        if(req.file && req.file.filename){

            const newUser = new User({...req.body,avatar:req.file.filename});
            const saveUser = await newUser.save()
            return res.status(201).json({ result: saveUser, message: "User Created" }).end();
        }else{
            const newUser = new User({...req.body});
            const saveUser = await newUser.save()
            return res.status(201).json({ result: saveUser, message: "User Created" }).end();
        }
    } catch (error) {
        console.log(error);
        
    }
});

router.put("/updateuser/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userDataToUpdate = req.body;
        const updatedUser = await User.findByIdAndUpdate(id, userDataToUpdate, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ result: updatedUser, message: "User updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.get("/updateuser/:id", async (req, res) => {
    try {
        const { id } = req.params; // Correct usage of req.params
        const updateuser = await User.findOne({ _id: id });
        if (!updateuser) {
            return res.status(404).json({ error: "User not found" }); // Respond with 404 if user is not found
        }
        return res.status(200).json({ result: updateuser }); // Respond with user data
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" }); // Handle errors properly
    }
});

router.delete('/deletetender/:tenderId', async (req, res) => {
    const { tenderId } = req.params;
    
    try {
      const deletedTender = await Tender.findByIdAndDelete(tenderId);
      if (!deletedTender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      res.json({ message: "Tender deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
});




router.get("/getallcitizen",async (req, res)=>{
    try {
        const allcitizen = await User.find({role:"citizen"})
        return res.status(201).json({ result: allcitizen }).end();
    } catch (error) {
        console.log(error);
    }
});

router.get("/getallcompany",async (req, res)=>{
    try {
        const allcompany = await User.find({role:"company"})
        return res.status(201).json({ result: allcompany }).end();
    } catch (error) {
        console.log(error);
    }
});

router.get("/getOneCompany/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const company = await User.findOne({ _id: id, role: "company" });

        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        return res.status(200).json({ result: company });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});



export default router;
