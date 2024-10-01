const express = require("express");
const router= express.Router();


//Posts
//Index 
router.get("/",(req,res)=>{
    res.send("GET for post");
});

//Show 
router.get("/:id",(req,res)=>{
    res.send("GET for show post");
});

//Post
router.post("/",(req,res)=>{
    res.send("POST for post");
});

//Delete
router.delete("/:id",(req,res)=>{
    res.send("DELETE for post ID");
});

module.exports = router;