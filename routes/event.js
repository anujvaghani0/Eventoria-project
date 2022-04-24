const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Organizer = require("../models/Organizer");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "." + file.mimetype.split("/")[1]);
    }
});

const upload = multer({storage: storage});

router.get("/", (req, res, next) => {
    res.redirect("../");
});

router.get("/add", (req, res, next) => {
    if (req.session.isAuthenticated && req.session.userType == 'organizer') {
        Organizer.findOne({username: req.session.username}, (err, organizer) => {
            if (err) {
                console.log(err);
                return res.redirect("../");
            }
    
            if (!organizer) {
                console.log({ message: `User with username: ${username} does not exist` });
                return res.redirect("/organizer/login");
            }

            const data = {
                organization: organizer.organization,
                hostname: organizer.fname + " " + organizer.lname,
                position: organizer.position,
                operation: "add"
            }

            res.render("pages/event-form", {data: data});
        });
    }
    else if (req.session.isAuthenticated && req.session.userType == 'user') {
        console.log("A user can't add event");
        res.redirect("/user/dashboard");
    }
    else if (req.session.isAuthenticated && req.session.userType == 'organizer') {
        res.redirect("/organizer/dashboard");
    }
    else {
        res.redirect("../");
    }
});

router.post("/add", upload.fields([{name: "orglogo", maxCount: 1}, {name: "hostsign", maxCount: 1}]) , async (req, res, next) => {
    console.log(req.body);
    const eventidExists = await Event.findOne({eventid: req.body.eventid.toLowerCase()});
    if (eventidExists) {
        console.log("Event with this Event ID already exists!");
        return res.redirect("/event/add");
    }

    console.log(req.files.orglogo);
    const event = new Event({
        eventid: req.body.eventid.toLowerCase(),
        eventname: req.body.eventname,
        organization: req.body.organization,
        eventdate: req.body.eventdate,
        hostname: req.body.hostname,
        position: req.body.position,
        orglogo: {
            data: fs.readFileSync("./uploads/" + req.files.orglogo[0].filename),
            contentType: req.files.orglogo[0].mimetype
        },
        hostsign: {
            data: fs.readFileSync("./uploads/" + req.files.hostsign[0].filename),
            contentType: req.files.hostsign[0].mimetype
        },
        hostusername: req.session.username
    });

    event.save((err) => {
        if (err) {
            return next(err);
        }
    });

    console.log(req.session);
    Organizer.findOne({username: req.session.username}, (err, organizer) => {
        if (err) {
            console.log(err);
            return res.redirect("../");
        }

        if (!organizer) {
            console.log({ message: `User with username: ${req.session.username} does not exist` });
            return res.redirect("/organizer/login");
        }

        organizer.events.push(req.body.eventid);
        organizer.save((err) => {
            if (err) {
                return next(err);
            }
            res.redirect('/organizer/dashboard');
        });
    });
});

router.get("/edit/:id", async (req, res, next) => {
    if (req.session.isAuthenticated && req.session.userType == 'organizer') {
        Organizer.findOne({username: req.session.username}, (err, organizer) => {
            if (err) {
                console.log(err);
                return res.redirect("../");
            }
    
            if (!organizer) {
                console.log({ message: `User with username: ${username} does not exist` });
                return res.redirect("/organizer/login");
            }

            Event.findOne({eventid: req.params.id}, (err, event) => {
                if (err) {
                    console.log(err);
                    return res.redirect("../");
                }
        
                if (!event) {
                    console.log({ message: `Event with Event ID: ${req.params.id} does not exist` });
                    return res.redirect("/event/add");
                }
                let eventdate = event.eventdate.toISOString();
                console.log(typeof eventdate);
                const data = {
                    eventid: event.eventid,
                    eventname: event.eventname,
                    organization: event.organization,
                    eventdate: eventdate.slice(0, 10),
                    hostname: event.hostname,
                    position: event.position,
                    operation: "edit"
                }
    
                res.render("pages/event-form", {data: data});
            });
        });
    }
    else if (req.session.isAuthenticated && req.session.userType == 'user') {
        console.log("A user can't edit event");
        res.redirect("/user/dashboard");
    }
    else if (req.session.isAuthenticated && req.session.userType == 'organizer') {
        res.redirect("/organizer/dashboard");
    }
    else {
        res.redirect("../");
    }
});

router.post("/edit", upload.fields([{name: "orglogo", maxCount: 1}, {name: "hostsign", maxCount: 1}]), async (req, res, next) => {
    const event = await Event.findOne({eventid: req.body.eventid.toLowerCase()});
    if (!event) {
        console.log("Event with this Event ID doesn't exists!");
        return res.redirect("/event/add");
    }
    if (!event) {
        console.log("Event with this Event ID doesn't exists!");
        return res.redirect("/event/add");
    }

    event.eventname = req.body.eventname;
    event.organization = req.body.organization;
    event.eventdate = req.body.eventdate;
    event.hostname = req.body.hostname;
    event.position = req.body.position;
    event.orglogo = {
        data: fs.readFileSync("./uploads/" + req.files.orglogo[0].filename),
        contentType: req.files.orglogo[0].mimetype
    };
    event.hostsign = {
        data: fs.readFileSync("./uploads/" + req.files.hostsign[0].filename),
        contentType: req.files.hostsign[0].mimetype
    };

    event.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/organizer/dashboard');
    });
});

router.get("/delete/:id", async (req, res, next) => {
    const id = req.params.id.toLocaleLowerCase();
    if (req.session.isAuthenticated && req.session.userType == 'organizer') {
        Organizer.findOne({username: req.session.username}, (err, organizer) => {
            if (err) {
                console.log(err);
                return res.redirect("../");
            }
    
            if (!organizer) {
                console.log({ message: `User with username: ${username} does not exist` });
                return res.redirect("/organizer/login");
            }

            Event.findOne({eventid: id}, (err, event) => {
                if (err) {
                    console.log(err);
                    return res.redirect("../");
                }
        
                if (!event) {
                    console.log({ message: `Event with Event ID: ${id} does not exist` });
                    return res.redirect("/event/add");
                }

                if (event.hostusername !== req.session.username) {
                    console.log({ message: `You are not the Event Organizer` });
                    return res.redirect("/event/add");
                }
                console.log(organizer);
                Event.deleteOne({_id: event._id});
                organizer.events.pull(id);
                organizer.save((err) => {
                    if (err) {
                        return next(err);
                    }
                    res.redirect('/organizer/dashboard');
                });
            });
        });
    }
    else if (req.session.isAuthenticated && req.session.userType == 'user') {
        console.log("A user can't edit event");
        res.redirect("/user/dashboard");
    }
    else if (req.session.isAuthenticated && req.session.userType == 'organizer') {
        res.redirect("/organizer/dashboard");
    }
    else {
        res.redirect("../");
    }
});

module.exports = router;