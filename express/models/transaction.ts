// This is a simple in-memory model for demonstration
// In a real application, you'd use a database

interface Transaction {
  id: string;
  accountId: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  description: string;
  balance: number;
  date: Date;
}

// In-memory storage
const transactions: Transaction[] = [];

export const TransactionModel = {
  create: async (
    transactionData: Omit<Transaction, "id">,
  ): Promise<Transaction> => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
    };

    transactions.push(newTransaction);
    return newTransaction;
  },

  findById: async (id: string): Promise<Transaction | undefined> => {
    return transactions.find((transaction) => transaction.id === id);
  },

  findByAccountId: async (accountId: string): Promise<Transaction[]> => {
    return transactions
      .filter((transaction) => transaction.accountId === accountId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date, newest first
  },
};
