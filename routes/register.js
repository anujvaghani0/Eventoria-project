const express = require("express");
const router = express.Router();
// const register = require("../models/register");
const {passwordHash, comparePasswords} = require("../helpers/auth");

router.get("/", (req, res, next) => {
    res.redirect("/user/signup");
});

router.get("/register", (req, res, next) => {
    if (!req.session.isAuthenticated) {
        res.render("pages/signup", {userType: "user"});
    }
    else if (req.session.isAuthenticated && req.session.userType == 'user') {
        res.redirect("/user/dashboard");
    }
    else if ((req.session.isAuthenticated && req.session.userType == 'organizer')) {
        res.redirect("/organizer/dashboard");
    }
    else {
        req.session.destroy();
        res.redirect("/");
    }
});

router.post("/register", async (req, res, next) => {
    console.log(req.body);
    const hashedPassword = await passwordHash(req.body.password, 10);
    const user = new User({
        fname: req.body.fname,
        lname: req.body.lname,
        username: req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        password: hashedPassword,
        regDate: new Date(),
        type: 'user'
    });

    const usernameExists = await User.findOne({username: req.body.username.toLowerCase()});

    const emailExists = await User.findOne({email: req.body.email.toLowerCase()});

    if (usernameExists) {
        console.log("User with this Username already exists!");
        return res.redirect("/user/signup");
    }
    if (emailExists) {
        console.log("User with this Email already exists!");
        return res.redirect("/user/signup");
    }

    user.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/user/login');
    })
});

// router.get("/login", (req, res, next) => {
//     if (!req.session.isAuthenticated) {
//         res.render("pages/login", {userType: "user"});
//     }
//     else if (req.session.isAuthenticated && req.session.userType == 'user') {
//         res.redirect("/user/dashboard");
//     }
//     else if ((req.session.isAuthenticated && req.session.userType == 'organizer')) {
//         res.redirect("/organizer/dashboard");
//     }
//     else {
//         req.session.destroy();
//         res.redirect("/");
//     }
// });

// router.post("/login", (req, res, next) => {
//     const username = req.body.username.toLowerCase();
//     const password = req.body.password;
//     User.findOne({username: username}, async (err, user) => {
//         if (err) {
//             console.log(err);
//             return res.redirect("/user/login");
//         }

//         if (!user) {
//             console.log({ message: `User with username: ${username} does not exist` });
//             return res.redirect("/user/login");
//         }

//         if (!(await comparePasswords(password, user.password))) {
//             console.log({ message: `Incorrect Username/Password provided` });
//             return res.redirect("/user/login");
//         }

//         req.session.userType = 'user';
//         req.session.username = username;
//         req.session.isAuthenticated = true;
//         res.redirect("/user/dashboard");
//     });
// });

// router.all("/logout", (req, res, next) => {
//     req.session.destroy();
//     res.redirect("/user/login");
// });

// router.get("/dashboard", (req, res, next) => {
//     if (req.session.isAuthenticated && req.session.userType == 'user') {
//         res.render("pages/dashboard")
//     }
//     else if (req.session.isAuthenticated && req.session.userType == 'organizer') {
//         console.log("Invalid Authorization! You are not a participant!");
//         res.redirect("/organizer/dashboard");
//     }
//     else if (!req.session.isAuthenticated) {
//         res.redirect("/user/signup");
//     }
//     else {
//         req.session.destroy();
//         res.redirect("/");
//     }
// });

module.exports = router;