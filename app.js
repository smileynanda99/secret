//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const encryption = require("mongoose-encryption");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const port = 3000;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/secretsDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


// userSchema.plugin(encryption, { secret: process.env.SECRETS, encryptedFields: ['password'] });
const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/logout", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login", {
        helpEmail: "",
        helpPassword: ""
    });
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if (err) {
            console.log(err);
        } else {
            const user = new User({
                email: req.body.username,
                password: hash
            })
            user.save((err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render("secrets");
                }
            });
        }
    });

});

app.post("/login", (req, res) => {
    const name = req.body.username;
    const pass = req.body.password;

    User.findOne({ email: name }, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(pass, foundUser.password, function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (result == true) {
                            res.render("secrets");
                        } else {
                            res.render("login", {
                                helpEmail: "",
                                helpPassword: "Wrong Password!"
                            });
                            console.log("Wrong Password");
                        }
                    }
                });
            } else {
                res.render("login", {
                    helpEmail: "User is not exist!",
                    helpPassword: ""
                });
                console.log("User is not exist");
            }
        }
    });
});

app.listen(port || process.env.PORT, () => {
    console.log(`server is running at port :${port}`);
})