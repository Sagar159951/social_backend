const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User")
 
// create a post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savePost = await newPost.save();
        res.status(200).json(savePost);
    } catch (e) {
        res.status(500).json(e);
    }
})

// update a post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(post.userID === req.body.userID){
            await post.updateOne({$set: req.body})
            res.status(200).json("your post has been updated")
        } else {
            res.status(403).json("cannot update your post")
        }    
    } catch (error) {
        res.status(500).json(error)
    }
})

// delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(post.userID === req.body.userID){
            await post.deleteOne();
            res.status(200).json("your post has been deleted")
        } else {
            res.status(403).json("cannot delete your post")
        }    
    } catch (error) {
        res.status(500).json(error)
    }
})

// like dislike a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userID)){
            await post.updateOne({ $push: { likes: req.body.userID }})
            res.status(200).json("post liked")
        } else {
            await post.updateOne({ $pull: { likes: req.body.userID }})
            res.status(200).json("post unliked")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

// get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post);
    } catch (error) {
        console.log(error)
    }
})

// get timeline posts
router.get("/timeline/all", async (req, res) => {
    try {
        const currentUser = await User.findById(req.body.userID)
        const userPosts = await Post.find({ userID: currentUser._id})
        const friendPosts = await Promise.all(
            currentUser.followins.map((friendID) => {
                return Post.find({userID: friendID});
            })
        )
        res.status(200).json(userPosts.concat(...friendPosts))
    } catch (error) {
        res.status(500).json(error)
        console.log(error)
    }
})

module.exports = router;