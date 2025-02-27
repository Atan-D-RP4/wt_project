// This is a simple in-memory model for demonstration
// In a real application, you'd use a database

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  username: string;
  password: string;
  createdAt: Date;
}

const admin = {
  id: 'admin-id',
  fullName: 'Admin User',
  email: 'admin@gmail.com',
  phone: '123-456-7890',
  address: '123 Admin St',
  city: 'Adminville',
  state: 'CA',
  zipCode: '12345',
  username: 'admin',
  password: 'password',
  createdAt: new Date(),
}

// In-memory storage
const users: User[] = [admin];

export const UserModel = {
  create: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    users.push(newUser);
    return newUser;
  },

  findByEmail: async (email: string): Promise<User | undefined> => {
    return users.find(user => user.email === email);
  },

  findByUsername: async (username: string): Promise<User | undefined> => {
    console.log(users);
    return users.find(user => user.username === username);
  },

  findById: async (id: string): Promise<User | undefined> => {
    return users.find(user => user.id === id);
  }
};
