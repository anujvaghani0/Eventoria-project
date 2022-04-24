const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const userRouter = require("./routes/user");
const organizerRouter = require("./routes/organizer");
const eventRouter = require("./routes/event");
const routers = require("./routes/register");
const logger = require("morgan");

const PORT = process.env.PORT || 4000

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60,
        secure: false
    },
    saveUninitialized: false,
    resave: false
}));

app.use(logger('dev'));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use("/user", userRouter);
app.use("/organizer", organizerRouter);
app.use("/event", eventRouter);
// app.use("/router", routers);

app.get("/", (req, res, next) => {
    res.render("pages/index");
})
app.get("/register", (req, res, next) => {
    res.render("pages/register");
})

app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});