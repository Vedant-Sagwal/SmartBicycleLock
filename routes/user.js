const express=require("express")
const Router=express.Router()
const User=require("../models/user")
const {getUser,setUser}=require("../services/auth")
const { restrictToLoggedinUser } = require("../middlewares/auth")
const History = require("../models/history")

Router.get("/register",(req,res)=>{
    res.render("register");
})
Router.get("/login",(req,res)=>{
    res.render("login");

})

Router.post("/register",async (req,res)=>{
     const {name,email,password,cycleNum}=req.body;
     if (!name || !email || !password || !cycleNum) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });

      }
    const us=await User.findOne({name,email,password});
    if(us){
        return res.redirect("/api/cycle")
    }
    else{

        await User.create({
            name:name,
            email:email,
            password:password,
            cycleNum:cycleNum
        }).then(User => {
            res.redirect("/api/cycle");
        })
        .catch(error => {
            
            res.status(400).json({ message: "Error creating user", error });
        });
    }

})

Router.post("/login",async (req,res)=>{
    const {email,password}=req.body;
    const user=await User.findOne({email,password});
    console.log(user);
    if(!user){
        return res.render("register",{
            error:"Invalid user",
        });
    }
    const token1=setUser(user);
    
    res.cookie("token",token1,{ 
        maxAge: 24 * 60 * 60 * 1000, 
        httpOnly: true,  
        secure: true,   
        sameSite: 'Strict' ,
        domain:"localhost"
      });
    
    console.log(token1);
    
    console.log(res.cookie);

    res.redirect("/api/menu");

})

Router.get('/history', restrictToLoggedinUser, async (req, res) => {
    try {
        const history = await History.find({ userId: req.user._id }).sort({ timestamp: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving history', error });
    }
});

module.exports=Router