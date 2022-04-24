const express = require("express");
const router = express.Router();
const Organizer = require("../models/Organizer");
const {passwordHash, comparePasswords} = require("../helpers/auth");
const { redirect } = require("express/lib/response");

router.get("/", (req, res, next) => {
    res.redirect("/organizer/signup");
});

router.get("/signup", (req, res, next) => {
    if (!req.session.isAuthenticated) {
        res.render("pages/signup", {userType: "organizer"});
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
    const organizer = new Organizer({
        fname: req.body.fname,
        lname: req.body.lname,
        organization: req.body.organization,
        position: req.body.position,
        username: req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        password: hashedPassword,
        regDate: new Date(),
        type: 'organizer'
    });

    const usernameExists = await Organizer.findOne({username: req.body.username.toLowerCase()});

    const emailExists = await Organizer.findOne({email: req.body.email.toLowerCase()});

    if (usernameExists) {
        console.log("User with this Username already exists!");
        return res.redirect("/organizer/signup");
    }
    if (emailExists) {
        console.log("User with this Email already exists!");
        return res.redirect("/organizer/signup");
    }

    organizer.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/organizer/login');
    })
});

router.get("/login", (req, res, next) => {
    if (!req.session.isAuthenticated) {
        res.render("pages/login", {userType: "organizer"});
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
    Organizer.findOne({username: username}, async (err, organizer) => {
        if (err) {
            console.log(err);
            return res.redirect("/organizer/login");
        }

        if (!organizer) {
            console.log({ message: `User with username: ${username} does not exist` });
            return res.redirect("/organizer/login");
        }

        if (!(await comparePasswords(password, organizer.password))) {
            console.log({ message: `Incorrect Username/Password provided` });
            return res.redirect("/organizer/login");
        }

        req.session.userType = 'organizer';
        req.session.username = username;
        req.session.isAuthenticated = true;
        res.redirect("/organizer/dashboard");
    });
});

router.all("/logout", (req, res, next) => {
    req.session.destroy();
    res.redirect("/organizer/login");
});

router.get("/dashboard", (req, res, next) => {
    if (req.session.isAuthenticated && req.session.userType == 'organizer') {
        Organizer.findOne({username: req.session.username}, (err, organizer) => {
            if (err) {
                console.log(err);
                return redirect("../");
            }
            if (!organizer) {
                console.log({ message: `User with username: ${req.session.username} does not exist` });
                return res.redirect("/organizer/login");
            }
            const data = {
                name: organizer.fname + " " + organizer.lname,
                organization: organizer.organization,
                position: organizer.position,
                username: organizer.username.toLowerCase(),
                email: organizer.email.toLowerCase(),
                regDate: organizer.regDate.toISOString().slice(0, 10),
                type: organizer.type
            }
            res.render("pages/dashboard", {data: data});
        });
    }
    else if (req.session.isAuthenticated && req.session.userType == 'user'){
        console.log("Invalid Authorization! You are not an Organizer!");
        res.redirect("/user/dashboard");
    }
    else if (!req.session.isAuthenticated) {
        res.redirect("/organizer/signup");
    }
    else {
        req.session.destroy();
        res.redirect("/");
    }
});

module.exports = router;