const mongoose = require('mongoose');
const Message = require('../../models/Message');

describe('Message Model', () => {
  describe('Message Schema Validation', () => {
    it('should create a message with all required fields', async () => {
      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'This is a test message'
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      expect(savedMessage._id).toBeDefined();
      expect(savedMessage.userId.toString()).toBe(messageData.userId.toString());
      expect(savedMessage.firstName).toBe(messageData.firstName);
      expect(savedMessage.lastName).toBe(messageData.lastName);
      expect(savedMessage.email).toBe(messageData.email);
      expect(savedMessage.contact).toBe(messageData.contact);
      expect(savedMessage.message).toBe(messageData.message);
      expect(savedMessage.status).toBe('pending');
      expect(savedMessage.date).toBeDefined();
      expect(savedMessage.replies).toEqual([]);
    });

    it('should fail to create message without required userId field', async () => {
      const messageData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'This is a test message'
      };

      const message = new Message(messageData);

      await expect(message.save()).rejects.toThrow(/userId.*required/i);
    });

    it('should fail to create message without required firstName field', async () => {
      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'This is a test message'
      };

      const message = new Message(messageData);

      await expect(message.save()).rejects.toThrow(/firstName.*required/i);
    });

    it('should fail to create message without required lastName field', async () => {
      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'This is a test message'
      };

      const message = new Message(messageData);

      await expect(message.save()).rejects.toThrow(/lastName.*required/i);
    });

    it('should fail to create message without required email field', async () => {
      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        contact: '+1234567890',
        message: 'This is a test message'
      };

      const message = new Message(messageData);

      await expect(message.save()).rejects.toThrow(/email.*required/i);
    });

    it('should fail to create message without required contact field', async () => {
      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        message: 'This is a test message'
      };

      const message = new Message(messageData);

      await expect(message.save()).rejects.toThrow(/contact.*required/i);
    });

    it('should fail to create message without required message field', async () => {
      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890'
      };

      const message = new Message(messageData);

      await expect(message.save()).rejects.toThrow(/message.*required/i);
    });

    it('should set default status to pending', async () => {
      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'This is a test message'
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      expect(savedMessage.status).toBe('pending');
    });

    it('should allow valid status values', async () => {
      const validStatuses = ['pending', 'replied', 'closed'];

      for (const status of validStatuses) {
        const messageData = {
          userId: new mongoose.Types.ObjectId(),
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          contact: '+1234567890',
          message: 'This is a test message',
          status: status
        };

        const message = new Message(messageData);
        const savedMessage = await message.save();

        expect(savedMessage.status).toBe(status);
      }
    });

    it('should fail to create message with invalid status', async () => {
      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'This is a test message',
        status: 'invalid'
      };

      const message = new Message(messageData);

      await expect(message.save()).rejects.toThrow(/not a valid enum value/i);
    });
  });

  describe('Message Replies', () => {
    it('should create message with replies', async () => {
      const replyData = {
        content: 'Thank you for your message. We will get back to you soon.',
        adminId: new mongoose.Types.ObjectId(),
        date: new Date(),
        emailSent: true
      };

      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'This is a test message',
        replies: [replyData]
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      expect(savedMessage.replies).toHaveLength(1);
      expect(savedMessage.replies[0].content).toBe(replyData.content);
      expect(savedMessage.replies[0].adminId.toString()).toBe(replyData.adminId.toString());
      expect(savedMessage.replies[0].emailSent).toBe(replyData.emailSent);
      expect(savedMessage.replies[0].date).toBeDefined();
    });

    it('should create message with multiple replies', async () => {
      const reply1 = {
        content: 'Thank you for your message.',
        adminId: new mongoose.Types.ObjectId(),
        emailSent: true
      };

      const reply2 = {
        content: 'We have processed your request.',
        adminId: new mongoose.Types.ObjectId(),
        emailSent: false
      };

      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'This is a test message',
        replies: [reply1, reply2]
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      expect(savedMessage.replies).toHaveLength(2);
      expect(savedMessage.replies[0].content).toBe(reply1.content);
      expect(savedMessage.replies[1].content).toBe(reply2.content);
    });

    it('should set default emailSent to true for replies', async () => {
      const replyData = {
        content: 'Thank you for your message.',
        adminId: new mongoose.Types.ObjectId()
      };

      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'This is a test message',
        replies: [replyData]
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      expect(savedMessage.replies[0].emailSent).toBe(true);
    });
  });

  describe('Message Model Methods', () => {
    it('should have correct model name', () => {
      expect(Message.modelName).toBe('Message');
    });

    it('should create multiple messages', async () => {
      const messageData1 = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'First message'
      };

      const messageData2 = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        contact: '+0987654321',
        message: 'Second message'
      };

      const message1 = new Message(messageData1);
      const message2 = new Message(messageData2);

      await message1.save();
      await message2.save();

      const messages = await Message.find({});
      expect(messages).toHaveLength(2);
    });

    it('should find messages by status', async () => {
      const messageData1 = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'Pending message',
        status: 'pending'
      };

      const messageData2 = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        contact: '+0987654321',
        message: 'Replied message',
        status: 'replied'
      };

      await new Message(messageData1).save();
      await new Message(messageData2).save();

      const pendingMessages = await Message.find({ status: 'pending' });
      expect(pendingMessages).toHaveLength(1);
      expect(pendingMessages[0].firstName).toBe('John');

      const repliedMessages = await Message.find({ status: 'replied' });
      expect(repliedMessages).toHaveLength(1);
      expect(repliedMessages[0].firstName).toBe('Jane');
    });

    it('should find messages by userId', async () => {
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      const messageData1 = {
        userId: userId1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'Message from John'
      };

      const messageData2 = {
        userId: userId2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        contact: '+0987654321',
        message: 'Message from Jane'
      };

      await new Message(messageData1).save();
      await new Message(messageData2).save();

      const johnMessages = await Message.find({ userId: userId1 });
      expect(johnMessages).toHaveLength(1);
      expect(johnMessages[0].firstName).toBe('John');

      const janeMessages = await Message.find({ userId: userId2 });
      expect(janeMessages).toHaveLength(1);
      expect(janeMessages[0].firstName).toBe('Jane');
    });

    it('should update message status', async () => {
      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'Test message'
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      expect(savedMessage.status).toBe('pending');

      // Update status to replied
      savedMessage.status = 'replied';
      await savedMessage.save();

      const updatedMessage = await Message.findById(savedMessage._id);
      expect(updatedMessage.status).toBe('replied');
    });

    it('should add reply to message', async () => {
      const messageData = {
        userId: new mongoose.Types.ObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contact: '+1234567890',
        message: 'Test message'
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      const reply = {
        content: 'Thank you for your message.',
        adminId: new mongoose.Types.ObjectId(),
        emailSent: true
      };

      savedMessage.replies.push(reply);
      await savedMessage.save();

      const updatedMessage = await Message.findById(savedMessage._id);
      expect(updatedMessage.replies).toHaveLength(1);
      expect(updatedMessage.replies[0].content).toBe(reply.content);
    });
  });
});
