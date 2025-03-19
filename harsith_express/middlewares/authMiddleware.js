
function authMiddleware(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		res.redirect("/login");
	}
	console.log("Request is authenticated");
	next();
}

module.exports = authMiddleware;
