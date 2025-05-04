from datetime import datetime
import enum

from flask.config import T
from sqlalchemy import (
    Column,
    DateTime,
    Engine,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    create_engine,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import (
    Relationship,
    Session,
    declarative_base,
    relationship,
    sessionmaker,
)

Base = declarative_base()


class User(Base):
    __tablename__: str = 'users'

    id: Column[int] = Column(Integer, primary_key=True)
    username: Column[str] = Column(String(50), unique=True, nullable=False)
    email: Column[str] = Column(String(100), unique=True, nullable=False)
    password_hash: Column[str] = Column(String(255), nullable=False)

    accounts = relationship('Account', back_populates='user')


class AccountType(enum.Enum):
    SAVINGS = 'savings'
    CHECKING = 'checking'

class Account(Base):
    __tablename__: str = 'accounts'

    id: Column[int] = Column(Integer, primary_key=True)
    user_id: Column[int] = Column(Integer, ForeignKey('users.id'), nullable=False)
    account_number: Column[str] = Column(String(20), unique=True, nullable=False)
    account_type: Column[Enum] = Column(
        Enum(AccountType, name='account_types'), nullable=False
    )
    balance: Column[float] = Column(Float, default=0.0)

    user = relationship('User', back_populates='accounts')
    transactions = relationship(
        'Transaction', foreign_keys='Transaction.to_account_id', back_populates='to_account'
    )
    transactions_from = relationship(
        'Transaction', foreign_keys='Transaction.from_account_id', back_populates='from_account'
    )


class TransactionType(enum.Enum):
    DEPOSIT = 'deposit'
    WITHDRAWAL = 'withdrawal'
    TRANSFER = 'transfer'


class Transaction(Base):
    __tablename__: str = 'transactions'

    id: Column[int] = Column(Integer, primary_key=True)
    # TODO: CHange the foreign key to account_number
    to_account_id: Column[int] = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    from_account_id: Column[int] = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    amount: Column[float] = Column(Float, nullable=False)
    transaction_type: Column[str] = Column(
        Enum(TransactionType, name='transaction_types'),
    )
    description: Column[str] = Column(String(255))
    timestamp: Column[datetime] = Column(DateTime, default=datetime.now)

    # TODO: Change the relationship to account_number
    to_account: Relationship[Account] = relationship(
        'Account', foreign_keys=[to_account_id], back_populates='transactions'
    )
    from_account: Relationship[Account] = relationship(
        'Account', foreign_keys=[from_account_id], back_populates='transactions_from'
    )


class DatabaseManager:
    def __init__(self, db_url: str):
        """
        Initialize database connection and session

        :param db_url: SQLAlchemy database connection URL
        """
        try:
            self.engine: Engine = create_engine(db_url)
            Base.metadata.create_all(self.engine)
            self.Session: sessionmaker[Session] = sessionmaker(bind=self.engine)
        except SQLAlchemyError as e:
            print(f'Failed to connect to database with url: {db_url}')
            raise Exception(f'Database connection error: {e}') from e

    def create_user(self, username: str, email: str, password_hash: str) -> User | None:
        """
        Create a new user in the database

        :return: Created User object
        """
        print(f'Creating user: {username}, {email}')
        with self.Session() as session:
            try:
                user = User(
                    username=username,
                    email=email,
                    password_hash=password_hash,
                )
                session.add(user)
                session.commit()
                print(f'User created: {user.username}, {user.email}')
                # Create a default account for the user
                self.create_account(user.id, 'savings', 1000.0)
                return user
            except SQLAlchemyError as e:
                session.rollback()
                raise Exception(f'Error creating user: {e}') from e

    def update_user(
        self,
        user_id: int,
        username: str | None = None,
        email: str | None = None,
        password_hash: str | None = None,
    ) -> User | None:
        """
        Update user information in the database
        :param user_id: ID of the user to update
        :param username: New username
        :param email: New email
        :param password_hash: New password hash
        :return: Updated User object
        """
        with self.Session() as session:
            try:
                user = session.query(User).filter_by(id=user_id).first()
                if not user:
                    raise ValueError(f'User {user_id} not found')

                if username:
                    user.username = username
                if email:
                    user.email = email
                if password_hash:
                    user.password_hash = password_hash

                session.commit()
                return user
            except SQLAlchemyError as e:
                session.rollback()
                raise Exception(f'Error updating user: {e}') from e

    def create_account(
        self,
        user_id: int,
        account_type: str,
        initial_balance: float = 0.0,
    ) -> Account | None:
        """
        Create a new account for a user

        :return: Created Account object
        """
        with self.Session() as session:
            try:
                account = Account(
                    user_id=user_id,
                    account_number=str(user_id) + str(int(datetime.now().timestamp())),
                    account_type=account_type,
                    balance=initial_balance,
                )
                session.add(account)
                session.commit()
                return account
            except SQLAlchemyError as e:
                session.rollback()
                raise Exception(f'Error creating account: {e}') from e

    def delete_account(self, account_id: int) -> None:
        """
        Delete an account from the database

        :param account_id: ID of the account to delete
        """
        with self.Session() as session:
            try:
                account = session.query(Account).filter_by(id=account_id).first()
                if not account:
                    raise ValueError(f'Account {account_id} not found')
                session.delete(account)
                session.commit()
            except SQLAlchemyError as e:
                session.rollback()
                raise Exception(f'Error deleting account: {e}') from e

    def get_user_by_name(self, name: str) -> User | None:
        """
        Retrieve a user by name

        :return: User object
        """
        with self.Session() as session:
            try:
                return session.query(User).filter_by(username=name).first()
            except SQLAlchemyError as e:
                raise Exception(f'Error retrieving user: {e}') from e

    def get_user_by_id(self, id: int) -> User | None:
        """
        Retrieve a user by ID

        :return: User object
        """
        with self.Session() as session:
            try:
                return session.query(User).filter_by(id=id).first()
            except SQLAlchemyError as e:
                raise Exception(f'Error retrieving user: {e}') from e

    def get_user_accounts(self, user_id: int) -> list[Account] | None:
        """
        Retrieve all accounts for a specific user

        :return: List of Account objects
        """
        with self.Session() as session:
            try:
                return session.query(Account).filter_by(user_id=user_id).all()
            except SQLAlchemyError as e:
                raise Exception(f'Error retrieving user accounts: {e}') from e

    def get_account_transactions(
        self, account_id: Column[int], limit: int | None = None
    ) -> list[Transaction] | None:
        """
        Retrieve transactions for a specific account

        :param limit: Optional limit on number of transactions
        :return: List of Transaction objects
        """
        with self.Session() as session:
            try:
                query = (
                    session.query(Transaction)
                    .filter_by(from_account_id=account_id)
                    .union(session.query(Transaction).filter_by(to_account_id=account_id))
                    .order_by(Transaction.timestamp.desc())
                )
                if limit:
                    query = query.limit(limit)
                return query.all()
            except SQLAlchemyError as e:
                raise Exception(f'Error retrieving account transactions: {e}') from e

    def transfer_funds(
        self, from_account_number: int, to_account_number: int, amount: float
    ) -> None:
        """
        Transfer funds from one account to another

        :param from_account_id: ID of the account to transfer from
        :param to_account_id: ID of the account to transfer to
        :param amount: Amount to transfer
        """
        with self.Session() as session:
            try:
                from_account = (
                    session.query(Account).filter_by(account_number=from_account_number).first()
                )
                to_account = (
                    session.query(Account).filter_by(account_number=to_account_number).first()
                )

                if not from_account or not to_account:
                    print(f'Account not found: {from_account_number}, {to_account_number}')
                    raise ValueError('One or both accounts not found')

                if from_account.balance < amount:
                    raise ValueError('Insufficient funds in the source account')

                # Deduct from the source account
                from_account.balance -= amount

                # Add to the destination account
                to_account.balance += amount

                # Record the transaction
                session.add(
                    Transaction(
                        from_account_id=from_account.id,
                        to_account_id=to_account.id,
                        amount=amount,
                        transaction_type=TransactionType.TRANSFER.value,
                        description=f'Transfer from account {from_account.account_number} \
							to account {to_account.account_number}',
                    )
                )

                session.commit()
            except SQLAlchemyError as e:
                session.rollback()
                raise Exception(f'Error during transfer: {e}') from e

    def deposit(self, account_number: int, amount: float) -> None:
        """
        Deposit funds into an account

        :param account_id: ID of the account to deposit into
        :param amount: Amount to deposit
        """
        with self.Session() as session:
            try:
                account: Account = (
                    session.query(Account).filter_by(account_number=account_number).first()
                )
                print(account)
                if not account:
                    raise ValueError(f'Account {account_number} not found')

                account.balance += amount

                session.add(
                    Transaction(
                        to_account_id=account.id,
                        from_account_id=account.id,
                        amount=amount,
                        transaction_type=TransactionType.DEPOSIT.value,
                        description=f'Deposit into account {account.account_number}',
                    )
                )

                session.commit()
            except SQLAlchemyError as e:
                session.rollback()
                raise Exception(f'Error during deposit: {e}') from e
