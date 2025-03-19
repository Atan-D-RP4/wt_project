// Import Libraries
const express = require("express");
const session = require("express-session");
const cors = require("cors");

// Import middleware
const authMiddleware = require("./middlewares/authMiddleware.js");

// Import Routes
const accountRoutes = require("./routes/accountRoutes.js");
const authRoutes = require("./routes/authRoutes.js");


const PORT = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: "yourSecretKey", // Replace with a strong secret key
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }, // Set to true in production with HTTPS
}));
app.use(cors({
	origin: "http://localhost:3000", // specific origin or '*' for all
	methods: "GET,POST,PUT,DELETE",
	credentials: true,
}));

app.use(express.static("public"));
app.set("view engine", "ejs");

// Routers
app.use("/api/account", accountRoutes);

// Index page
app.get("/", (_req, res) => {
	res.redirect("/dashboard");
});

// Login page
app.get("/login", (_req, res) => {
	res.render("login");
});

app.get("/register", (_req, res) => {
	res.render("register");
});

// Create a dashboard route protected by auth middleware
app.get("/dashboard", (req, res) => {
	authMiddleware(req, res, () => {
		res.render("dashboard", { user: req.user.username });
	});
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
