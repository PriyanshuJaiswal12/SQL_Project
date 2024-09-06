const { faker } = require('@faker-js/faker'); //Require faker pakage to generate fake random data
const mysql = require('mysql2');
const express = require("express");
const app = express();
// Using uuid to create uniquie id's
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const methodOverride = require("method-override");
// const bodyParser = require('body-parser');

app.use(methodOverride("_method"));  //To use method override -> because we are using PATCH request
app.use(express.urlencoded({ extended: true })); // -> To parse our form data

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));


// To create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'kiit'
});

//Generate random fake data using faker package
let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};


//GET (/) home route -> To Fetch & show total no. of user in DB 
app.get("/", (req, res) => {
    let q = `SELECT COUNT(*) FROM user`;

    // How to use connection To do changes in database or place/write some query.
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let value = result[0]['COUNT(*)'];
            // console.log(value);
            res.render("home.ejs", { value });
        });
    }
    catch (err) {
        res.send("Some error in DB");
    }

});

// Show route -> To show username , email , and id of all user
app.get("/user", (req, res) => {
    let q = `SELECT * FROM user`;

    // How to use connection To do changes in database or place/write some query.
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            // console.log(users)
            res.render("show.ejs", { users });
        });
    }
    catch (err) {
        res.send("Some error in DB");
    }

});

// Edit Route
app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0]
            res.render("edit.ejs", { user });
        });
    }
    catch (err) {
        res.send("Some error in DB");
    }
});

//UPDATE Route -> update username into db
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password: formPass, username: newUsername } = req.body;

    //Selecting user based on their id
    let q = `SELECT * FROM user WHERE id = '${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0]
            if (formPass != user.password) {
                res.send("WRONG Password");
            }
            else {
                //Query to update username in db
                let q2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`;

                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    res.redirect("/user");
                });
            }
        });
    }
    catch (err) {
        res.send("Some error in DB");
    }
});

//POST -> To add a new user (Create route) -> We will use 2 route here 
/* Serve the form -> GET (/posts/new) */
app.get("/user/new", (req, res) => {
    res.render("new.ejs");
});
/* Add the new post -> POST (/posts) */
app.post("/user/new", (req, res) => {     //To accept new post request at /user
    let { username, email, password } = req.body;
    let id = uuidv4();

    let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            console.log("added new user");
            res.redirect("/user");
        });
    }
    catch (err) {
        res.send("Some error in DB");
    }
});

//DELETE -> To delete specidic post (Delete route) -> /posts/:id
app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            res.render("delete.ejs", { user });
        });
    } catch (err) {
        res.send("some error with DB");
    }
});

app.delete("/user/:id/", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];

            if (user.password != password) {
                res.send("WRONG Password entered!");
            } else {
                let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    else {
                        console.log(result);
                        console.log("deleted!");
                        res.redirect("/user");
                    }
                });
            }
        });
    } catch (err) {
        res.send("some error with DB");
    }
});



app.listen("3000", () => {
    console.log("server is listening to port 3000...");
});

// To close the connection
// connection.end();