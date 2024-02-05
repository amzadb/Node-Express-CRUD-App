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
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
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

router.get("/add", (req, resp) => {
    resp.render('add-user', { title: "Add User" });
});

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

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image
    }, () => {
        try {
            req.session.message = {
                type: 'success',
                message: 'User updated successfully!'
            };
            // await req.session.save();
            resp.redirect('/')
        } catch (saveError) {
            console.error('Error updating user:', saveError);
            return resp.status(500).json({ error: 'Error updating user' });
        }
    });
});

router.get("/delete/:id", async (req, resp) => {
    let id = req.params.id;
    User.findOneAndRemove(id, () => {
        if (req.file.filename != '') {
            try {
                fs.unlinkSync("./upload/" + req.file.filename);
            } catch(err) {
                console.log(err);
            }
        }
        try {
            req.session.message = {
                type: 'success',
                message: 'User deleted successfully!'
            };
            // await req.session.save();
            resp.redirect('/')
        } catch (saveError) {
            console.error('Error deleting user:', saveError);
            return resp.status(500).json({ error: 'Error deleting user' });
        }
    });    
});

module.exports = router;