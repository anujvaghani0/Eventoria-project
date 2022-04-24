const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {passwordHash, comparePasswords} = require("../helpers/auth");

router.get("/", (req, res, next) => {
    res.redirect("/user/signup");
});

router.get("/signup", (req, res, next) => {
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

router.post("/signup", async (req, res, next) => {
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

router.get("/login", (req, res, next) => {
    if (!req.session.isAuthenticated) {
        res.render("pages/login", {userType: "user"});
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

router.post("/login", (req, res, next) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    User.findOne({username: username}, async (err, user) => {
        if (err) {
            console.log(err);
            return res.redirect("/user/login");
        }

        if (!user) {
            console.log({ message: `User with username: ${username} does not exist` });
            return res.redirect("/user/login");
        }

        if (!(await comparePasswords(password, user.password))) {
            console.log({ message: `Incorrect Username/Password provided` });
            return res.redirect("/user/login");
        }

        req.session.userType = 'user';
        req.session.username = username;
        req.session.isAuthenticated = true;
        res.redirect("/user/dashboard");
    });
});

router.all("/logout", (req, res, next) => {
    req.session.destroy();
    res.redirect("/user/login");
});

router.get("/dashboard", (req, res, next) => {
    if (req.session.isAuthenticated && req.session.userType == 'user') {
        User.findOne({username: req.session.username}, (err, user) => {
            if (err) {
                console.log(err);
                return redirect("../");
            }
            if (!user) {
                console.log({ message: `User with username: ${req.session.username} does not exist` });
                return res.redirect("/user/login");
            }
            const data = {
                name: user.fname + " " + user.lname,
                username: user.username,
                email: user.email,
                regDate: user.regDate.toISOString().slice(0, 10),
                type: user.type
            }
            res.render("pages/dashboard", {data: data});
        });
    }
    else if (req.session.isAuthenticated && req.session.userType == 'organizer') {
        console.log("Invalid Authorization! You are not a participant!");
        res.redirect("/organizer/dashboard");
    }
    else if (!req.session.isAuthenticated) {
        res.redirect("/user/signup");
    }
    else {
        req.session.destroy();
        res.redirect("/");
    }
});

module.exports = router;