const User = require('../../models/User');

describe('User Model', () => {
  it('should create a user with required fields', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.role).toBe('user'); // default role
  });

  it('should fail to create user without required name', async () => {
    const userData = {
      email: 'john@example.com'
    };

    const user = new User(userData);

    await expect(user.save()).rejects.toThrow();
  });

  it('should fail to create user without required email', async () => {
    const userData = {
      name: 'John Doe'
    };

    const user = new User(userData);

    await expect(user.save()).rejects.toThrow();
  });

  it('should create user with admin role', async () => {
    const userData = {
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.role).toBe('admin');
  });

  it('should create user with Google OAuth fields', async () => {
    const userData = {
      name: 'Google User',
      email: 'google@example.com',
      googleId: '123456789'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.googleId).toBe(userData.googleId);
    expect(savedUser.password).toBeUndefined(); // password is optional
  });

  it('should create user with selected foods', async () => {
    const userData = {
      name: 'Food Lover',
      email: 'food@example.com',
      selectedFoods: [
        {
          food: '507f1f77bcf86cd799439011', // mock ObjectId
          quantity: 2,
          price: 25.99,
          name: 'Pizza'
        }
      ]
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.selectedFoods).toHaveLength(1);
    expect(savedUser.selectedFoods[0].quantity).toBe(2);
    expect(savedUser.selectedFoods[0].name).toBe('Pizza');
  });

  it('should create user with payment history', async () => {
    const userData = {
      name: 'Paying User',
      email: 'pay@example.com',
      payments: [
        {
          paymentIntentId: 'pi_123456789',
          amount: 100,
          currency: 'usd',
          status: 'succeeded',
          tableNumber: 5,
          slotTime: '7-9PM'
        }
      ]
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.payments).toHaveLength(1);
    expect(savedUser.payments[0].amount).toBe(100);
    expect(savedUser.payments[0].deducted).toBe(false); // default value
  });

  it('should validate role enum values', async () => {
    const userData = {
      name: 'Invalid Role User',
      email: 'invalid@example.com',
      role: 'invalid'
    };

    const user = new User(userData);

    await expect(user.save()).rejects.toThrow();
  });
});
