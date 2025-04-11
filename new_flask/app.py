from functools import wraps
from os import getenv

from flask import Flask, flash, redirect, render_template, request, session, url_for
from waitress import serve
from werkzeug.security import check_password_hash, generate_password_hash

from database import DatabaseManager, User
from flask_session import Session

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'
_ = Session(app)

DB_URL = getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/flask_ebank')
db_manager = DatabaseManager(DB_URL)


def login_required(f):
	"""Decorate routes to require login.

	https://flask.palletsprojects.com/en/latest/patterns/viewdecorators/
	"""

	@wraps(f)
	def decorated_function(*args, **kwargs):
		if session.get('user_id') is None:
			return redirect('/login')
		return f(*args, **kwargs)

	return decorated_function


@app.route('/')
@login_required
def index():
	user = db_manager.get_user_by_id(session['user_id'])
	accounts = db_manager.get_user_accounts(session['user_id'])
	transactions = [db_manager.get_account_transactions(account.id) for account in accounts]
	return render_template('index.html', user=user, accounts=accounts, transactions=transactions)


@app.route('/register', methods=['GET', 'POST'])
def register():
	"""Register user"""
	session.clear()

	if request.method == 'POST':
		username = request.form.get('username')
		email = request.form.get('email')
		password = request.form.get('password')
		confirmation = request.form.get('confirmation')
		print(
			f'username: {username}, email: {email}, \
			password: {password}, confirmation: {confirmation}'
		)
		if not username:
			flash('must provide username')
			return redirect('/register', 403)

		if not email:
			flash('must provide password')
			return redirect('/register', 403)

		if not password:
			flash('must provide password')
			return redirect('/register', 403)

		if not confirmation:
			flash('must provide password confirmation')
			return redirect('/register', 403)

		if password != confirmation:
			flash('passwords must match')
			return redirect('/register', 403)

		user = db_manager.get_user_by_name(username)

		if user:
			flash('username already exists')
			return redirect('/register', 403)

		password = request.form.get('password')
		confirmation = request.form.get('confirmation')

		if password is None or confirmation is None:
			flash('passwords must match')
			return redirect('/register', 403)

		if password != confirmation:
			flash('passwords must match')
			return redirect('/register', 403)

		hash = generate_password_hash(password)

		user = db_manager.create_user(username, email, hash)
		if user is None:
			raise Exception('Failed to Register User')

		session['user_id'] = user.id

		return redirect('/')
	return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
	"""Log user in"""
	# Forget any user_id
	session.clear()

	# User reached route via POST (as by submitting a form via POST)
	if request.method == 'POST':
		username = request.form.get('username')
		password = request.form.get('password')
		# Ensure username was submitted
		if not username:
			flash('must provide username')
			return redirect('/', 403)

		# Ensure password was submitted
		if not password:
			flash('must provide password')
			return redirect('/', 403)

		# Query database for username
		user: User = db_manager.get_user_by_name(username)
		password = request.form.get('password')
		if not user or password is None:
			flash('invalid username and/or password')
			return redirect('/', 403)

		# Ensure username exists and password is correct
		if not check_password_hash(user.password_hash, password):
			flash('invalid username and/or password')
			return redirect('/', 403)

		# Remember which user has logged in
		session['user_id'] = user.id

		# Redirect user to home page
		return redirect('/')

	# User reached route via GET (as by clicking a link or via redirect)
	return render_template('/')


@app.route('/logout')
def logout():
	"""Log user out"""
	# Forget any user_id
	session.clear()

	# Redirect user to login form
	return redirect('/')


@app.route('/add_account', methods=['GET', 'POST'])
@login_required
def add_account():
	"""Add account"""
	if request.method == 'POST':
		account_type = request.form.get('account_type')
		if not account_type:
			flash('must provide account type')
			return redirect('/add_account')

		db_manager.create_account(session['user_id'], account_type)
		return redirect('/')
	return render_template('add_account.html')


@app.route('/transfer', methods=['GET', 'POST'])
@login_required
def transfer():
	"""Transfer money between accounts"""
	if request.method == 'POST':
		from_account_id = request.form.get('from_account')
		to_account_id = request.form.get('to_account')
		if not from_account_id or not to_account_id:
			flash('must provide from and to account')
			return redirect(url_for('transfer'))
		from_account_id = int(from_account_id)
		to_account_id = int(to_account_id)

		amount = request.form.get('amount')
		if not amount:
			flash('must provide amount')
			return redirect(url_for('transfer'))
		amount = float(amount)

		if from_account_id == to_account_id:
			flash('Cannot transfer to the same account')
			return redirect(url_for('transfer'))

		try:
			db_manager.transfer_funds(from_account_id, to_account_id, amount)
			flash('Transfer successful')
			return redirect(url_for('index'))
		except Exception as e:
			flash(str(e))
			return redirect(url_for('transfer'))

	user = db_manager.get_user_by_id(session['user_id'])
	accounts = db_manager.get_user_accounts(session['user_id'])
	return render_template('transfer.html', user=user, accounts=accounts)


if __name__ == '__main__':
	# app.run(debug=True)
	print('Starting WSGI server on localhost:5000')
	serve(app, host='127.0.0.1', port=5000)
