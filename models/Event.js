const mongoose = require("mongoose");
const MONGOURI = process.env.MONGOURI;
mongoose.connect(MONGOURI, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on("error", console.error.bind(console, 'MongoDB connection error:'));

const eventSchema = new mongoose.Schema({
    eventid: {
        type: String,
        required: true,
        max: 30,
        unique: true
    },
    eventname: {
        type: String,
        required: true,
        max: 30
    },
    organization: {
        type: String,
        required: true,
        max: 50
    },
    eventdate: {
        type: Date,
        required: true
    },
    hostname: {
        type: String,
        required: true,
        max: 61
    },
    hostusername: {
        type: String,
        required: true,
        max: 30
    },
    position: {
        type: String,
        required: true,
        max: 50
    },
    orglogo: {
        data: Buffer,
        contentType: String,
    },
    hostsign: {
        data: Buffer,
        contentType: String,
    }
});

module.exports = mongoose.model('Event', eventSchema, "events");