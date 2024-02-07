const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');

// Image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single("image");

// Insert user into DB
router.post('/add', upload, async (req, resp) => {
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
    }
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image
    });
    let new_user;
    try {
        new_user = await user.save();
        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        await req.session.save()
        resp.redirect('/')
    } catch (saveError) {
        console.error('Error saving user:', saveError);
        return resp.status(500).json({ error: 'Error saving user' });
    }
});

// Listing the users on homepage
router.get('/', async (req, resp) => {
    try {
        const users = await User.find({});
        resp.render('home', {
            title: "Home Page",
            users: users
        })
    } catch (error) {
        console.error('Error fetching users:', error);
        resp.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add user page
router.get("/add", (req, resp) => {
    resp.render('add-user', { title: "Add User" });
});

// Edit user page
router.get("/edit/:id", async (req, resp) => {
    let id = req.params.id;
    try {
        const user = await User.findById(id);
        resp.render('edit-user', {
            title: "Edit User",
            user: user
        })
    } catch (error) {
        console.error('Error fetching user:', error);
        resp.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update user details
router.post("/update/:id", upload, async (req, resp) => {
    let id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./upload/" + req.body.old_image);
        } catch(err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        const user = await User.findById(id);
        user.name = req.body.name;
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.image = new_image;
        user.save();
        req.session.message = {
            type: 'success',
            message: 'User updated successfully!'
        };
        await req.session.save();
        resp.redirect('/')
    } catch (error) {
        console.error('Error updating user:', saveError);
        return resp.status(500).json({ error: 'Error updating user' });
    }
});

// Delete user
router.get("/delete/:id", async (req, resp) => {
    try {
        let id = req.params.id;
        const user = await User.findById(id);
        await user.deleteOne();
        req.session.message = {
            type: 'success',
            message: 'User deleted successfully!'
        };
        await req.session.save();
        resp.redirect('/');
    } catch (error) {
        console.error('Error deleting user:', saveError);
        return resp.status(500).json({ error: 'Error deleting user' });
    }    
});

module.exports = router;
