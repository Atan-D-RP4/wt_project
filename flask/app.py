from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required, lookup, usd

# Configure application
app = Flask(__name__)

# Custom filter
app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
_ = Session(app)

head = list(range(9999999))

# Configure CS50 Library to use SQLite database
try:
    db = SQL("sqlite:///finances.db")
except Exception as e:
    print("Failed to connect to database")
    print(e)
    exit(1)

"""
DB Schema:
CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, username TEXT NOT NULL, hash
TEXT NOT NULL, cash NUMERIC NOT NULL DEFAULT 10000.00);
CREATE TABLE sqlite_sequence(name,seq);
CREATE UNIQUE INDEX username ON users (username);
CREATE TABLE transactions (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
symbol TEXT NOT NULL,
shares INTEGER NOT NULL,
price NUMERIC NOT NULL,
timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);
"""


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
@login_required
def index():
    """Show portfolio of stocks"""
    if request.method == "GET":
        cash = db.execute("SELECT cash FROM users WHERE id = ?", session["user_id"])[0][
            "cash"
        ]

        stocks = db.execute(
            "SELECT symbol, SUM(shares) as shares FROM transactions WHERE user_id = ? GROUP BY symbol HAVING shares > 0",
            session["user_id"],
        )

        total = cash
        for stock in stocks:
            quote = lookup(stock["symbol"])
            stock["price"] = usd(quote["price"])
            stock["total"] = usd(stock["shares"] * quote["price"])
            stock["name"] = quote["name"]
            total += quote["price"] * stock["shares"]

        return render_template(
            "index.html",
            stocks=stocks,
            total=usd(total),
            cash=usd(cash),
        )
    return apology("TODO")


@app.route("/buy", methods=["GET", "POST"])
@login_required
def buy():
    """Buy shares of stock"""
    if request.method == "POST":
        symbol = request.form.get("symbol")
        shares = request.form.get("shares")

        if not symbol:
            return apology("invalid symbol", 400)

        quote = lookup(symbol.upper())
        if not quote:
            return apology("invalid symbol", 400)
        if not shares or not shares.isdigit() or int(shares) < 1:
            return apology("invalid shares", 400)
        shares = int(shares)

        cash = db.execute("SELECT cash FROM users WHERE id = ?", session["user_id"])[0][
            "cash"
        ]

        total = quote["price"] * shares

        if cash < total:
            return apology("insufficient funds", 400)
        db.execute(
            "UPDATE users SET cash = cash - ? WHERE id = ?",
            total,
            session["user_id"],
        )
        db.execute(
            "INSERT INTO transactions (user_id, symbol, shares, price) VALUES (?, ?, ?, ?)",
            session["user_id"],
            quote["symbol"],
            shares,
            quote["price"],
        )

        flash(f"Bought {shares} shares of {symbol} for USD {usd(total)}!")
        return redirect("/")
    return render_template("buy.html")


@app.route("/history")
@login_required
def history():
    """Show history of transactions"""
    stocks = db.execute(
        "SELECT * FROM transactions WHERE user_id = ?",
        session["user_id"],
    )
    if request.method == "GET":
        for stock in stocks:
            symbol_lookup = lookup(stock["symbol"])
            if symbol_lookup is None:
                raise Exception("Error performing lookup")
            stock["name"] = symbol_lookup["name"]
            stock["price"] = usd(stock["price"])
        return render_template("history.html", stocks=stocks)
    return apology("TODO")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""
    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        if not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute(
            "SELECT * FROM users WHERE username = ?",
            request.form.get("username"),
        )

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(
            rows[0]["hash"],
            request.form.get("password"),
        ):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

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


@app.route("/quote", methods=["GET", "POST"])
@login_required
def quote():
    """Get stock quote."""
    if request.method == "POST":
        quote = lookup(request.form.get("symbol"))

        if not quote:
            return apology("invalid symbol", 400)
        quote["price"] = usd(quote["price"])

        return render_template("quote.html", quote=quote)
    return render_template("quote.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    session.clear()

    if request.method == "POST":
        if not request.form.get("username"):
            return apology("must provide username", 400)

        if not request.form.get("password"):
            return apology("must provide password", 400)

        if not request.form.get("confirmation"):
            return apology("must provide password confirmation", 400)

        if request.form.get("password") != request.form.get("confirmation"):
            return apology("passwords must match", 400)

        duplicate = db.execute(
            "SELECT * FROM users WHERE username = ?",
            request.form.get("username"),
        )

        if duplicate:
            return apology("username already exists", 400)

        hash = generate_password_hash(request.form.get("password"))

        result = db.execute(
            "INSERT INTO users (username, hash) VALUES (?, ?)",
            request.form.get("username"),
            hash,
        )

        if not result:
            return apology("username already exists", 403)

        session["user_id"] = result

        return redirect("/")
    return render_template("register.html")


@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    """Sell shares of stock"""
    try:
        stocks = db.execute(
            "SELECT symbol, SUM(shares) as shares FROM transactions WHERE user_id = ? GROUP BY symbol HAVING shares > 0",
            session["user_id"],
        )
    except Exception as e:
        print(f"Failed to execute database operation: {e}")
        return apology("Failed to retrieve user portfolio data", 400)

    if request.method == "GET":
        for stock in stocks:
            stock["price"] = usd(lookup(stock["symbol"])["price"])
            return render_template("sell.html", stocks=stocks)

    elif request.method == "POST":
        symbol = request.form.get("symbol")
        shares = request.form.get("shares")

        if not symbol:
            return apology("invalid symbol", 400)
        if not shares or not shares.isdigit() or int(shares) < 1:
            return apology("invalid shares", 400)
        shares = int(shares)

        for stock in stocks:
            print()
            print(stock["symbol"] + symbol)
            print()
            if stock["symbol"] == symbol:
                if stock["shares"] < shares:
                    return apology("insufficient shares", 400)
                break
            continue

        cur_quote = lookup(symbol)
        if not cur_quote:
            return apology("invalid symbol", 400)

        sale = cur_quote["price"] * shares

        try:
            db.execute(
                "UPDATE users SET cash = cash + ? WHERE id = ?",
                sale,
                session["user_id"],
            )
            db.execute(
                "INSERT INTO transactions (user_id, symbol, shares, price) VALUES (?, ?, ?, ?)",
                session["user_id"],
                symbol,
                -shares,
                cur_quote["price"],
            )
        except Exception as e:
            print(f"Failed to execute database operation: {e}")
            return apology("Transaction Failed", 400)

        flash(f"Sold {shares} shares of {symbol} for USD {usd(sale)}!")
    return redirect("/")
