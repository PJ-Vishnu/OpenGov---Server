import express from "express";

// import user model
import { User } from "../models/user.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    console.log(req.body);

    const isMatch = await User.findOne({ email: req.body.email  });
    console.log(isMatch)
    if (isMatch) {
        const isPassword = await User.findOne({  email: req.body.email, password: req.body.password  });

        if(isPassword){
            return res.status(200).json({ result: isPassword}).end();
        }else{
            return res.status(409).json({ message: "Password not maching!" }).end();
        }
    } else {
        return res.status(409).json({ message: "Mail not found!" }).end();
    }


});


export default router;
