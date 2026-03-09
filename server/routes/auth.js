const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/register",async(req,res)=>{

const hashed = await bcrypt.hash(req.body.password,10);

const user = new User({
name:req.body.name,
email:req.body.email,
password:hashed
});

await user.save();

res.send("User registered");

});

module.exports = router;