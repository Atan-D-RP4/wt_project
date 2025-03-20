const db = require("../database.js");

// Pure JavaScript equivalent of the above TypeScript enum
const AccountType = {
	Checking: "checking",
	Savings: "savings",
	Both: "both",
};

//const Account =  {
//  id,
//  userId,
//  type,
//  balance,
//  createdAt,
//};
// Define the above TS Account class in pure JavaScript with JSDoc

const client = db;

const AccountModel = {
	create: async (
		accountData,
	) => {
		try {
			const id = 0;
			const count = await client.query(
				"SELECT COUNT(*) FROM accounts",
			);
			if (count.rows !== undefined) {
				id = count.rows[0]["COUNT(*)"] + 1;
			}

			const newAccount = {
				...accountData,
				id,
				createdAt: new Date(),
			};

			// Check if user already exists
			const accounts = await client.query(
				"SELECT * FROM accounts WHERE id = ?",
				[newAccount.id],
			);

			if (accounts.rows == undefined) {
				console.log("SQL Query Error");
				return newAccount;
			}
			if (accounts.rows.length > 0) {
				console.log("Account already exists");
				return accounts.rows[0];
			}

			await client.query(
				"INSERT INTO accounts (id, userId, type, balance, createdAt) VALUES (?, ?, ?, ?, ?)",
				[
					newAccount.id,
					newAccount.userId,
					newAccount.type,
					newAccount.balance,
					newAccount.createdAt,
				],
			);
			console.log("Account created");

			return newAccount;
		} catch (error) {
			console.error("Account Creation error:", error);
			throw new Error("Server error creating account");
		}
	},

	listAll: async () => {
		const accounts = await client.query("SELECT * FROM accounts");

		if (accounts.rows == undefined) {
			return [];
		}

		return accounts.rows;
	},

	findById: async (id) => {
		const accounts = await client.query(
			"SELECT * FROM accounts WHERE id = ?",
			[id],
		);

		if (accounts.rows == undefined) {
			throw new Error("Account not found");
		}

		return accounts.rows.length > 0 ? accounts.rows[0] : undefined;
	},

	findByUserId: async (userId) => {
		const accounts = await client.query(
			"SELECT * FROM accounts WHERE userId = ?",
			[userId],
		);

		if (accounts.rows == undefined) {
			return [];
		}

		return accounts.rows;
	},

	findTransactions: async (id) => {
		const transactions = await client.query(
			"SELECT * FROM transactions WHERE fromId = ?",
			[id],
		);

		if (transactions.rows == undefined) {
			return [];
		}

		return transactions.rows;
	},

	updateBalance: async (
		id,
		newBalance,
	) => {
		console.log(
			"UPDATE accounts SET balance = " + newBalance + " WHERE id = " + id,
		);
		await client.query(
			"UPDATE accounts SET balance = ? WHERE id = ?",
			[newBalance, id],
		);

		return AccountModel.findById(id);
	},
};

/**
 * @typedef {Object} Account
 * @property {number} id
 * @property {number} userId
 * @property {string} type
 * @property {number} balance
 * @property {Date} createdAt
 */
module.exports = { AccountModel, AccountType };
