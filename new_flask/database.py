from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional

Base = declarative_base()

class User(Base):
    __tablename__: str = 'users'

    id: Column[int] = Column(Integer, primary_key=True)
    username: Column[str] = Column(String(50), unique=True, nullable=False)
    email: Column[str] = Column(String(100), unique=True, nullable=False)
    password_hash: Column[str] = Column(String(255), nullable=False)
    full_name: Column[str] = Column(String(100), nullable=False)

    accounts = relationship('Account', back_populates='user')

class Account(Base):
    __tablename__: str = 'accounts'

    id: Column[int] = Column(Integer, primary_key=True)
    user_id: Column[int] = Column(Integer, ForeignKey('users.id'), nullable=False)
    account_number: Column[str] = Column(String(20), unique=True, nullable=False)
    account_type: Column[Enum] = Column(Enum('savings', 'checking', name='account_types'), nullable=False)
    balance: Column[float] = Column(Float, default=0.0)

    user  = relationship('User', back_populates='accounts')
    transactions = relationship('Transaction', back_populates='account')

class Transaction(Base):
    __tablename__: str = 'transactions'

    id: Column[int]=Column(Integer, primary_key=True)
    account_id: Column[int] =Column(Integer, ForeignKey('accounts.id'), nullable=False)
    amount: Column[float] = Column(Float, nullable=False)
    transaction_type: Column[str] = Column(String(20), nullable=False)  # e.g., 'deposit', 'withdrawal', 'transfer'
    description:Column[str] = Column(String(255))
    timestamp: Column[datetime] = Column(DateTime, default=datetime.now())

    account = relationship('Account', back_populates='transactions')

class DatabaseManager:
    def __init__(self, db_url: str):
        """
        Initialize database connection and session

        :param db_url: SQLAlchemy database connection URL
        """
        try:
            self.engine = create_engine(db_url)
            Base.metadata.create_all(self.engine)
            self.Session = sessionmaker(bind=self.engine)
        except SQLAlchemyError as e:
            raise Exception(f"Database connection error: {e}")

    def create_user(self, username: str, email: str, password_hash: str, full_name: str) -> User:
        """
        Create a new user in the database

        :return: Created User object
        """
        with self.Session() as session:
            try:
                user = User(
                    username=username,
                    email=email,
                    password_hash=password_hash,
                    full_name=full_name
                )
                session.add(user)
                session.commit()
                return user
            except SQLAlchemyError as e:
                session.rollback()
                raise Exception(f"Error creating user: {e}")

    def create_account(self, user_id: int, account_number: str, account_type: str, initial_balance: float = 0.0) -> Account:
        """
        Create a new account for a user

        :return: Created Account object
        """
        with self.Session() as session:
            try:
                account = Account(
                    user_id=user_id,
                    account_number=account_number,
                    account_type=account_type,
                    balance=initial_balance
                )
                session.add(account)
                session.commit()
                return account
            except SQLAlchemyError as e:
                session.rollback()
                raise Exception(f"Error creating account: {e}")

    def record_transaction(self, account_id: int, amount: float, transaction_type: str, description: Optional[str] = None) -> Transaction:
        """
        Record a new transaction and update account balance

        :return: Created Transaction object
        """
        with self.Session() as session:
            try:
                # Find the account
                account = session.query(Account).filter_by(id=account_id).first()
                if not account:
                    raise ValueError("Account not found")

                # Create transaction
                transaction = Transaction(
                    account_id=account_id,
                    amount=amount,
                    transaction_type=transaction_type,
                    description=description
                )
                session.add(transaction)

                # Update account balance based on transaction type
                if transaction_type == 'deposit':
                    session.query(Account).filter_by(id=account_id).update({'balance': account.balance + amount})
                elif transaction_type == 'withdrawal':
                    if account.balance < amount:
                        raise ValueError("Insufficient funds")
                    session.query(Account).filter_by(id=account_id).update({'balance': account.balance - amount})

                session.commit()
                return transaction
            except SQLAlchemyError as e:
                session.rollback()
                raise Exception(f"Error recording transaction: {e}")

    def get_user_by_name(self, name: str) -> User:
        """
        Retrieve a user by name

        :return: User object
        """
        with self.Session() as session:
            try:
                return session.query(User).filter_by(username=name).first()
            except SQLAlchemyError as e:
                raise Exception(f"Error retrieving user: {e}")

    def get_user_accounts(self, user_id: int) -> list[Account]:
        """
        Retrieve all accounts for a specific user

        :return: List of Account objects
        """
        with self.Session() as session:
            try:
                return session.query(Account).filter_by(user_id=user_id).all()
            except SQLAlchemyError as e:
                raise Exception(f"Error retrieving user accounts: {e}")

    def get_account_transactions(self, account_id: int, limit: Optional[int] = None) -> list[Transaction]:
        """
        Retrieve transactions for a specific account

        :param limit: Optional limit on number of transactions
        :return: List of Transaction objects
        """
        with self.Session() as session:
            try:
                query = session.query(Transaction).filter_by(account_id=account_id).order_by(Transaction.timestamp.desc())
                if limit:
                    query = query.limit(limit)
                return query.all()
            except SQLAlchemyError as e:
                raise Exception(f"Error retrieving account transactions: {e}")

# Example usage
if __name__ == '__main__':
    # MySQL connection example (replace with your actual credentials)
    DB_URL = 'mysql+pymysql://username:password@localhost/ebank_db'
    db_manager = DatabaseManager(DB_URL)
