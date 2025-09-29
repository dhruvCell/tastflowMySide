const userController = require('../../controllers/userController');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('nodemailer');

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn(),
  validationResult: jest.fn()
}));

// Mock User methods to return chainable queries
const mockSelect = jest.fn().mockReturnThis();
const mockFindById = jest.fn().mockReturnValue({
  select: mockSelect
});
const mockFind = jest.fn().mockReturnValue({
  select: mockSelect
});

User.findById.mockImplementation(mockFindById);
User.find.mockImplementation(mockFind);

describe('User Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: {},
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        contact: '1234567890'
      };

      mockReq.body = userData;

      // Mock validation result
      const mockValidationResult = { isEmpty: jest.fn().mockReturnValue(true) };
      require('express-validator').validationResult.mockReturnValue(mockValidationResult);

      // Mock User.findOne to return null (user doesn't exist)
      User.findOne.mockResolvedValue(null);

      // Mock bcrypt
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');

      // Mock User.create
      const mockUser = { id: 'userId', ...userData };
      User.create.mockResolvedValue(mockUser);

      // Mock jwt.sign
      jwt.sign.mockReturnValue('token');

      await userController.createUser(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 'salt');
      expect(User.create).toHaveBeenCalledWith({
        name: userData.name,
        password: 'hashedPassword',
        email: userData.email,
        contact: userData.contact
      });
      expect(jwt.sign).toHaveBeenCalledWith({ user: { id: 'userId' } }, process.env.JWT_SECRET);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, authtoken: 'token' });
    });

    it('should return error if user already exists', async () => {
      mockReq.body = { email: 'existing@example.com' };

      const mockValidationResult = { isEmpty: jest.fn().mockReturnValue(true) };
      require('express-validator').validationResult.mockReturnValue(mockValidationResult);

      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Sorry, a user with this email already exists" });
    });

    it('should return validation errors', async () => {
      const mockValidationResult = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(['Validation error'])
      };
      require('express-validator').validationResult.mockReturnValue(mockValidationResult);

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ errors: ['Validation error'] });
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      mockReq.body = loginData;

      const mockValidationResult = { isEmpty: jest.fn().mockReturnValue(true) };
      require('express-validator').validationResult.mockReturnValue(mockValidationResult);

      const mockUser = {
        id: 'userId',
        email: loginData.email,
        password: 'hashedPassword',
        role: 'user'
      };
      User.findOne.mockResolvedValue(mockUser);

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      await userController.loginUser(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith({ user: { id: 'userId', role: 'user' } }, process.env.JWT_SECRET);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, authtoken: 'token' });
    });

    it('should return error for non-existent user', async () => {
      mockReq.body = { email: 'nonexistent@example.com', password: 'password' };

      const mockValidationResult = { isEmpty: jest.fn().mockReturnValue(true) };
      require('express-validator').validationResult.mockReturnValue(mockValidationResult);

      User.findOne.mockResolvedValue(null);

      await userController.loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Please try to login with correct credentials" });
    });

    it('should return error for Google OAuth user without password', async () => {
      mockReq.body = { email: 'google@example.com', password: 'password' };

      const mockValidationResult = { isEmpty: jest.fn().mockReturnValue(true) };
      require('express-validator').validationResult.mockReturnValue(mockValidationResult);

      const mockUser = {
        email: 'google@example.com',
        googleId: 'googleId',
        password: null
      };
      User.findOne.mockResolvedValue(mockUser);

      await userController.loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "This account was created using Google login. Please use 'Continue with Google' to sign in."
      });
    });

    it('should return error for incorrect password', async () => {
      mockReq.body = { email: 'john@example.com', password: 'wrongpassword' };

      const mockValidationResult = { isEmpty: jest.fn().mockReturnValue(true) };
      require('express-validator').validationResult.mockReturnValue(mockValidationResult);

      const mockUser = {
        email: 'john@example.com',
        password: 'hashedPassword'
      };
      User.findOne.mockResolvedValue(mockUser);

      bcrypt.compare.mockResolvedValue(false);

      await userController.loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Please try to login with correct credentials" });
    });
  });

  describe('getUser', () => {
    it('should return user details for existing user', async () => {
      mockReq.user = { id: 'userId' };

      const mockUser = {
        _id: 'userId',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user'
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis()
      };
      const promise = Promise.resolve(mockUser);
      mockQuery.then = promise.then.bind(promise);
      mockQuery.catch = promise.catch.bind(promise);
      User.findById.mockReturnValue(mockQuery);

      await userController.getUser(mockReq, mockRes);

      expect(User.findById).toHaveBeenCalledWith('userId');
      expect(mockQuery.select).toHaveBeenCalledWith("-password");
      expect(mockRes.send).toHaveBeenCalledWith(mockUser);
    });

    it('should return user details for temp OAuth user', async () => {
      mockReq.user = {
        googleId: 'googleId',
        name: 'Google User',
        email: 'google@example.com'
      };

      await userController.getUser(mockReq, mockRes);

      expect(mockRes.send).toHaveBeenCalledWith({
        _id: null,
        name: 'Google User',
        email: 'google@example.com',
        googleId: 'googleId',
        contact: ''
      });
    });

    it('should return 404 for non-existent user', async () => {
      mockReq.user = { id: 'nonexistentId' };

      const mockQueryNull = {
        select: jest.fn().mockReturnThis()
      };
      const promiseNull = Promise.resolve(null);
      mockQueryNull.then = promiseNull.then.bind(promiseNull);
      mockQueryNull.catch = promiseNull.catch.bind(promiseNull);
      User.findById.mockReturnValue(mockQueryNull);

      await userController.getUser(mockReq, mockRes);

      expect(User.findById).toHaveBeenCalledWith('nonexistentId');
      expect(mockQueryNull.select).toHaveBeenCalledWith("-password");
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users excluding admins', async () => {
      const mockUsers = [
        { name: 'User 1', email: 'user1@example.com', role: 'user' },
        { name: 'User 2', email: 'user2@example.com', role: 'user' }
      ];

      const mockQueryFind = {
        select: jest.fn().mockReturnThis()
      };
      const promiseFind = Promise.resolve(mockUsers);
      mockQueryFind.then = promiseFind.then.bind(promiseFind);
      mockQueryFind.catch = promiseFind.catch.bind(promiseFind);
      User.find.mockReturnValue(mockQueryFind);

      await userController.getAllUsers(mockReq, mockRes);

      expect(User.find).toHaveBeenCalledWith({ role: { $ne: 'admin' } });
      expect(mockQueryFind.select).toHaveBeenCalledWith("-password");
      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('getUserId', () => {
    it('should return user by ID', async () => {
      mockReq.params.id = 'userId';

      const mockUser = {
        _id: 'userId',
        name: 'John Doe',
        email: 'john@example.com'
      };

      const mockQueryId = {
        select: jest.fn().mockReturnThis()
      };
      const promiseId = Promise.resolve(mockUser);
      mockQueryId.then = promiseId.then.bind(promiseId);
      mockQueryId.catch = promiseId.catch.bind(promiseId);
      User.findById.mockReturnValue(mockQueryId);

      await userController.getUserId(mockReq, mockRes);

      expect(User.findById).toHaveBeenCalledWith('userId');
      expect(mockQueryId.select).toHaveBeenCalledWith("-password");
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 for non-existent user ID', async () => {
      mockReq.params.id = 'nonexistentId';

      const mockQueryIdNull = {
        select: jest.fn().mockReturnThis()
      };
      const promiseIdNull = Promise.resolve(null);
      mockQueryIdNull.then = promiseIdNull.then.bind(promiseIdNull);
      mockQueryIdNull.catch = promiseIdNull.catch.bind(promiseIdNull);
      User.findById.mockReturnValue(mockQueryIdNull);

      await userController.getUserId(mockReq, mockRes);

      expect(User.findById).toHaveBeenCalledWith('nonexistentId');
      expect(mockQueryIdNull.select).toHaveBeenCalledWith("-password");
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });
});
