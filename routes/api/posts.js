const express = require("express");
const passport = require("passport");
const router = express.Router();

const Post = require("../../models/post");
const Profile = require("../../models/profile");
const validatePostInput = require("../../validation/post");

//you just have to pass the endpoint as test as /api/users is already specified in server.js

router.get("/test", (req, res) => {
  res.json({ msg: "posts works!" });
});

//@route POST
//@desc Cannot like self-post
//@access PRIVATE

router.post("/like/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
 
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id).then(post => {
        if(post.user.toString() === req.user.id) {
           return res.json({'sameuser': 'You cannot like your post'})
        } 

        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
          return res.status(400).json({ 'alreadyliked': "User already liked this post" });
        }
          
        post.likes.unshift({ user: req.user.id });

        post.save().then(post => res.json(post));
        // return res.json(post);
      })
    }).catch(err => res.json(err))
})

//@route POST api/like/:id
//@desc Like route
//@access PRIVATE
// router.post(
//   "/like/:id",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     Profile.findOne({ user: req.user.id }).then(profile => {
//       Post.findById(req.params.id)
//         .then(post => {
//           if (
//             post.likes.filter(like => like.user.toString() === req.user.id)
//               .length > 0
//           ) {
//             return res
//               .status(400)
//               .json({ alreadyliked: "User already liked this post" });
//           }

//           post.likes.unshift({ user: req.user.id });

//           post.save().then(post => res.json(post));
//         })
//         .catch(err =>
//           res.status(404).json({ couldnotlike: "Could not like the post" })
//         );
//     });
//   }
// );

//@route POST api/dislike/:id
//@desc DisLike route
//@access PRIVATE
router.post(
  "/dislike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ cannotunlike: "You have not liked the post" });
          }

          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          post.likes.splice(removeIndex, 1);

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json(err));
    });
  }
);

//@route GET request to get all posts
//@access Public
//@desc Get all post

router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
});

//@route GET request for one particular post
//@access Public
//@desc Get post

router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ nopostfound: "No post found" }));
});

//@route DELETE request for one particular post
//@access Private
//@desc Delete post

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }

          //Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

//@route POST request to post data
//@access Private
//@desc Posting a comment or post

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

//@route POST api/posts/comment/:id
//@access PRIVATE
//@desc Post route to add a comment

router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
   Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      }

      //Add comment to the array
      post.comments.unshift(newComment);

      //Save
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({postnotfound: 'No post found'}));
})

//@route DELETE api/posts/comment/:id
//@desc Delete a comment
//@access PRIVATE

router.delete('/comment/:id/:commentid', passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      if(post.comments.filter(comment => comment._id.toString() === req.params.commentid).length === 0) {
        return res.status(404).json({'nocomment': 'No comment to delete'});
      }
      const removeIndex = post.comments.map(comment => comment._id.toString()).indexOf(req.params.commentid);

      //Splice the comment array
      post.comments.splice(removeIndex, 1);

      //save
      post.save().then(post => res.json(post));
      
    })
    .catch(err => res.status(404).json({notfound: 'Not found'}))
})


module.exports = router;
