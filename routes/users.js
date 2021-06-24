const router = require("express").Router();
const User = require("../models/User")
const bcrypt = require("bcrypt");
const { route } = require("./auth");

// update user
router.put("/:id", async (req, res) => {
    if(req.body.userID == req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch(e) {
                return res.status(500).json(e);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            });
            res.status(200).json("Account has been updated")
        } catch (e) {
            return res.status(500).json(e);
        }
    } else {
        return res.status(403).json("You can update only your account");
    }
});

// delete user
router.delete("/:id", async (req, res) => {
    if(req.body.userID == req.params.id || req.body.isAdmin){
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted sucessfully")
        } catch (e) {
            return res.status(500).json(e);
        }
    } else {
        return res.status(403).json("You can delete only your account");
    }
});

// get a user
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const {password, updatedAt, ...other} = user._doc
        res.status(200).json(other); 
    } catch (e) {
        res.status(500).json(e);
    }
})

// follow user
router.put("/:id/follow", async (req, res) => {
    if(req.body.userID !== req.params.id){
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userID);
            console.log(user); console.log(currentUser);
            if(!user.followers.includes(req.body.userID)){
                await user.updateOne({ $push: { followers: req.body.userID } });
                await currentUser.updateOne({ $push: { followins: req.params.id } });
                res.status(200).json("user has been followed");
            } else {
                res.status(403).json("You allready follow this user");
            }
        } catch (e) {
            res.status(500).json(e);
        }
    } else {
        res.status(403).json("You cant follow yourself")
    }
})

// unfollow user
router.put("/:id/unfollow", async (req, res) => {
    if(req.body.userID !== req.params.id){
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userID);
            console.log(user); console.log(currentUser);
            if(user.followers.includes(req.body.userID)){
                await user.updateOne({ $pull: { followers: req.body.userID } });
                await currentUser.updateOne({ $pull: { followins: req.params.id } });
                res.status(200).json("user has been unfollowed");
            } else {
                res.status(403).json("You dont follow this user");
            }
        } catch (e) {
            res.status(500).json(e);
        }
    } else {
        res.status(403).json("You cant unfollow yourself")
    }
})


router.get("/", (req, res) => {
    res.send("hey its user routes");
})

module.exports = router;