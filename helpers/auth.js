const bcrypt = require("bcrypt");

exports.passwordHash = async (password, saltRounds) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        //const salt = '$2b$10$4XqWVmcMCPv6kW8';
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (err) {
        console.log(err);
    }
    return null;
};

exports.comparePasswords = async (password, hash) => {
    try {
        const matchFound = await bcrypt.compare(password, hash);
        return matchFound;
    }
    catch (err) {
        console.log(err);
    }
    return false;
};