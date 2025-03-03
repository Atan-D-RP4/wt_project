// This is a simple in-memory model for demonstration
// In a real application, you'd use a database

export enum AccountType {
  Checking = "checking",
  Savings = "savings",
  Both = "both",
}

interface Account {
  id: string;
  userId: string;
  type: AccountType;
  accountNumber: string;
  balance: number;
  createdAt: Date;
}

// In-memory storage
export const accounts: Account[] = [];

export const AccountModel = {
  create: async (accountData: Omit<Account, 'id' | 'createdAt'>): Promise<Account> => {
    const newAccount: Account = {
      ...accountData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    accounts.push(newAccount);
    return newAccount;
  },

  findById: async (id: string): Promise<Account | undefined> => {
    return accounts.find(account => account.id === id);
  },

  findByUserId: async (userId: string): Promise<Account[]> => {
    return accounts.filter(account => account.userId === userId);
  },

  updateBalance: async (id: string, newBalance: number): Promise<Account | undefined> => {
    const account = accounts.find(account => account.id === id);

    if (account) {
      account.balance = newBalance;
    }

    return account;
  }
};
