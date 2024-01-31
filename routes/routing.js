const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');

// Image upload
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './upload');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now + "_" + file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single("image");

// Insert user into DB
router.post('/add', upload, (req, resp) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    });

    result = user.findOne({name: "Arshad"});
    console.log("result: " + result);

    let output;
    async() => {
        output = await user.save();
    };
    console.log(output);

    // user.save((err) => {
    //     if(err) {
    //         resp.json({message: err.message, type: 'danger'});
    //     } else {
    //         req.session.message = {
    //             type: 'success',
    //             message: 'User added successfully!'
    //         }
    //         resp.redirect('/');
    //     }
    // });

    
    // req.session.message = {
    //     type: 'success',
    //     message: 'User added successfully!'
    // }
    resp.redirect('/');

});

router.get('/', (req, resp) => {
    // resp.send('Home Page');
    resp.render('home', { title : "Home Page"})
});

router.get("/users", (req, resp) => {
    resp.send("All Users");
});

router.get("/add", (req, resp) => {
    resp.render('add-user', { title: "Add User"})
});

module.exports = router;