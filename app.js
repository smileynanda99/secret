//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const encryption = require("mongoose-encryption");

const port = 3000;
const secrets = "ThisIsSecrets";
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/secretsDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(encryption, { secret: secrets, encryptedFields: ['password'] });
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
    const user = new User({
        email: req.body.username,
        password: req.body.password
    })
    user.save((err) => {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets");
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
                if (foundUser.password === pass) {
                    res.render("secrets");
                } else {
                    res.render("login", {
                        helpEmail: "",
                        helpPassword: "Wrong Password!"
                    });
                    console.log("Wrong Password");
                }
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