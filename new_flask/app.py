from functools import wraps
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from flask import Flask, redirect, render_template, session, request, flash
from database import DatabaseManager
import os

app = Flask(__name__)
app.config["SESSION_TYPE"] = "filesystem"
_ = Session(app)

DB_URL = os.getenv('DATABASE_URL', 'mysql+pymysql://username:password@localhost/ebank_db')
db_manager = DatabaseManager(DB_URL)

def login_required(f):
    """Decorate routes to require login.

    https://flask.palletsprojects.com/en/latest/patterns/viewdecorators/
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated_function

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    session.clear()

    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")
        full_name = request.form.get("full_name")
        if not username:
            flash("must provide username")
            return redirect("/register", 403)

        if not email:
            flash("must provide password")
            return redirect("/register", 403)

        if not full_name:
            flash("must provide full name")
            return redirect("/register", 403)

        if not password:
            flash("must provide password")
            return redirect("/register", 403)

        if not confirmation:
            flash("must provide password confirmation")
            return redirect("/register", 403)

        if password != confirmation:
            flash("passwords must match")
            return redirect("/register", 403)

        users = db_manager.get_user_by_name(username)

        if username in users:
            flash("username already exists")
            return redirect("/register", 403)

        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        if password is None or confirmation is None:
            flash("passwords must match")
            return redirect("/register", 403)

        if password != confirmation:
            flash("passwords must match")
            return redirect("/register", 403)

        hash = generate_password_hash(password)

        _ = db_manager.create_user(username, email, hash, full_name)

        session["user_id"] = users[-1]["id"]

        return redirect("/")
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""
    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        # Ensure username was submitted
        if not username:
            flash("must provide username")
            return redirect("login.html", 403)

        # Ensure password was submitted
        if not password:
            flash("must provide password")
            return redirect("login.html", 403)

        # Query database for username
        users = db_manager.get_user_by_name(username)
        password = request.form.get("password")
        if not users or password is None:
            flash("invalid username and/or password")
            return redirect("login.html", 403)

        # Ensure username exists and password is correct
        if len(users) != 1 or not check_password_hash(users[0]["password_hash"], password):
            flash("invalid username and/or password")
            return redirect("login.html", 403)


        # Remember which user has logged in
        session["user_id"] = users[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""
    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


if __name__ == "main":
    app.run(debug=True)
