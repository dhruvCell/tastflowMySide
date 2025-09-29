const mongoose = require('mongoose');
const Slot = require('../../models/Slot');

describe('Slot Model', () => {
  describe('Slot Schema Validation', () => {
    it('should create a slot with all required fields', async () => {
      const slotData = {
        slotNumber: 1,
        number: 5,
        capacity: 4
      };

      const slot = new Slot(slotData);
      const savedSlot = await slot.save();

      expect(savedSlot._id).toBeDefined();
      expect(savedSlot.slotNumber).toBe(slotData.slotNumber);
      expect(savedSlot.number).toBe(slotData.number);
      expect(savedSlot.capacity).toBe(slotData.capacity);
      expect(savedSlot.reserved).toBe(false);
      expect(savedSlot.reservedBy).toBeNull();
      expect(savedSlot.reservationExpiry).toBeNull();
      expect(savedSlot.disabled).toBe(false);
      expect(savedSlot.reserveDate).toBeDefined();
    });

    it('should fail to create slot without required slotNumber field', async () => {
      const slotData = {
        number: 5,
        capacity: 4
      };

      const slot = new Slot(slotData);

      await expect(slot.save()).rejects.toThrow(/slotNumber.*required/i);
    });

    it('should fail to create slot without required number field', async () => {
      const slotData = {
        slotNumber: 1,
        capacity: 4
      };

      const slot = new Slot(slotData);

      await expect(slot.save()).rejects.toThrow(/number.*required/i);
    });

    it('should fail to create slot without required capacity field', async () => {
      const slotData = {
        slotNumber: 1,
        number: 5
      };

      const slot = new Slot(slotData);

      await expect(slot.save()).rejects.toThrow(/capacity.*required/i);
    });

    it('should fail to create slot with invalid slotNumber', async () => {
      const slotData = {
        slotNumber: 4, // Invalid: only 1, 2, 3 allowed
        number: 5,
        capacity: 4
      };

      const slot = new Slot(slotData);

      await expect(slot.save()).rejects.toThrow(/not a valid enum value/i);
    });

    it('should create slots with valid slotNumber values', async () => {
      const validSlotNumbers = [1, 2, 3];

      for (const slotNumber of validSlotNumbers) {
        const slotData = {
          slotNumber: slotNumber,
          number: 5,
          capacity: 4
        };

        const slot = new Slot(slotData);
        const savedSlot = await slot.save();

        expect(savedSlot.slotNumber).toBe(slotNumber);
      }
    });

    it.skip('should enforce unique constraint on slotNumber and number combination', async () => {
      const slotData1 = {
        slotNumber: 1,
        number: 5,
        capacity: 4
      };

      const slotData2 = {
        slotNumber: 1,
        number: 5, // Same combination should fail
        capacity: 6
      };

      const slot1 = new Slot(slotData1);
      await slot1.save();

      const slot2 = new Slot(slotData2);

      await expect(slot2.save()).rejects.toThrow(/duplicate key/i);
    });

    it('should allow same slotNumber with different number', async () => {
      const slotData1 = {
        slotNumber: 1,
        number: 5,
        capacity: 4
      };

      const slotData2 = {
        slotNumber: 1,
        number: 6, // Different number, same slotNumber should be allowed
        capacity: 4
      };

      const slot1 = new Slot(slotData1);
      const slot2 = new Slot(slotData2);

      await slot1.save();
      await slot2.save();

      const slots = await Slot.find({ slotNumber: 1 });
      expect(slots).toHaveLength(2);
    });

    it('should allow same number with different slotNumber', async () => {
      const slotData1 = {
        slotNumber: 1,
        number: 5,
        capacity: 4
      };

      const slotData2 = {
        slotNumber: 2,
        number: 5, // Same number, different slotNumber should be allowed
        capacity: 4
      };

      const slot1 = new Slot(slotData1);
      const slot2 = new Slot(slotData2);

      await slot1.save();
      await slot2.save();

      const slots = await Slot.find({ number: 5 });
      expect(slots).toHaveLength(2);
    });
  });

  describe('Slot Schema Optional Fields', () => {
    it('should set default values for optional fields', async () => {
      const slotData = {
        slotNumber: 1,
        number: 5,
        capacity: 4
      };

      const slot = new Slot(slotData);
      const savedSlot = await slot.save();

      expect(savedSlot.reserved).toBe(false);
      expect(savedSlot.reservedBy).toBeNull();
      expect(savedSlot.reservationExpiry).toBeNull();
      expect(savedSlot.disabled).toBe(false);
      expect(savedSlot.reserveDate).toBeDefined();
    });

    it('should create slot with reserved status', async () => {
      const userId = new mongoose.Types.ObjectId();
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour from now

      const slotData = {
        slotNumber: 1,
        number: 5,
        capacity: 4,
        reserved: true,
        reservedBy: userId,
        reservationExpiry: expiryDate
      };

      const slot = new Slot(slotData);
      const savedSlot = await slot.save();

      expect(savedSlot.reserved).toBe(true);
      expect(savedSlot.reservedBy.toString()).toBe(userId.toString());
      expect(savedSlot.reservationExpiry).toEqual(expiryDate);
    });

    it('should create disabled slot', async () => {
      const slotData = {
        slotNumber: 1,
        number: 5,
        capacity: 4,
        disabled: true
      };

      const slot = new Slot(slotData);
      const savedSlot = await slot.save();

      expect(savedSlot.disabled).toBe(true);
    });
  });

  describe('Slot Model Methods', () => {
    it('should have correct model name', () => {
      expect(Slot.modelName).toBe('Slot');
    });

    it('should create multiple slots', async () => {
      const slotData1 = {
        slotNumber: 1,
        number: 5,
        capacity: 4
      };

      const slotData2 = {
        slotNumber: 2,
        number: 3,
        capacity: 6
      };

      const slot1 = new Slot(slotData1);
      const slot2 = new Slot(slotData2);

      await slot1.save();
      await slot2.save();

      const slots = await Slot.find({});
      expect(slots).toHaveLength(2);
    });

    it('should find slots by slotNumber', async () => {
      const slotData1 = {
        slotNumber: 1,
        number: 5,
        capacity: 4
      };

      const slotData2 = {
        slotNumber: 2,
        number: 3,
        capacity: 6
      };

      await new Slot(slotData1).save();
      await new Slot(slotData2).save();

      const slot1Slots = await Slot.find({ slotNumber: 1 });
      expect(slot1Slots).toHaveLength(1);
      expect(slot1Slots[0].number).toBe(5);

      const slot2Slots = await Slot.find({ slotNumber: 2 });
      expect(slot2Slots).toHaveLength(1);
      expect(slot2Slots[0].number).toBe(3);
    });

    it('should find available slots (not reserved and not disabled)', async () => {
      const slotData1 = {
        slotNumber: 1,
        number: 5,
        capacity: 4,
        reserved: false,
        disabled: false
      };

      const slotData2 = {
        slotNumber: 1,
        number: 6,
        capacity: 4,
        reserved: true,
        disabled: false
      };

      const slotData3 = {
        slotNumber: 1,
        number: 7,
        capacity: 4,
        reserved: false,
        disabled: true
      };

      await new Slot(slotData1).save();
      await new Slot(slotData2).save();
      await new Slot(slotData3).save();

      const availableSlots = await Slot.find({
        reserved: false,
        disabled: false
      });

      expect(availableSlots).toHaveLength(1);
      expect(availableSlots[0].number).toBe(5);
    });

    it('should find reserved slots', async () => {
      const userId = new mongoose.Types.ObjectId();

      const slotData1 = {
        slotNumber: 1,
        number: 5,
        capacity: 4,
        reserved: true,
        reservedBy: userId
      };

      const slotData2 = {
        slotNumber: 1,
        number: 6,
        capacity: 4,
        reserved: false
      };

      await new Slot(slotData1).save();
      await new Slot(slotData2).save();

      const reservedSlots = await Slot.find({ reserved: true });
      expect(reservedSlots).toHaveLength(1);
      expect(reservedSlots[0].reservedBy.toString()).toBe(userId.toString());
    });

    it('should update slot reservation status', async () => {
      const slotData = {
        slotNumber: 1,
        number: 5,
        capacity: 4
      };

      const slot = new Slot(slotData);
      const savedSlot = await slot.save();

      expect(savedSlot.reserved).toBe(false);

      // Reserve the slot
      const userId = new mongoose.Types.ObjectId();
      const expiryDate = new Date(Date.now() + 3600000);

      savedSlot.reserved = true;
      savedSlot.reservedBy = userId;
      savedSlot.reservationExpiry = expiryDate;

      await savedSlot.save();

      const updatedSlot = await Slot.findById(savedSlot._id);
      expect(updatedSlot.reserved).toBe(true);
      expect(updatedSlot.reservedBy.toString()).toBe(userId.toString());
      expect(updatedSlot.reservationExpiry).toEqual(expiryDate);
    });

    it('should update slot disabled status', async () => {
      const slotData = {
        slotNumber: 1,
        number: 5,
        capacity: 4
      };

      const slot = new Slot(slotData);
      const savedSlot = await slot.save();

      expect(savedSlot.disabled).toBe(false);

      // Disable the slot
      savedSlot.disabled = true;
      await savedSlot.save();

      const updatedSlot = await Slot.findById(savedSlot._id);
      expect(updatedSlot.disabled).toBe(true);
    });

    it('should find slots by capacity', async () => {
      const slotData1 = {
        slotNumber: 1,
        number: 5,
        capacity: 4
      };

      const slotData2 = {
        slotNumber: 1,
        number: 6,
        capacity: 6
      };

      const slotData3 = {
        slotNumber: 1,
        number: 7,
        capacity: 4
      };

      await new Slot(slotData1).save();
      await new Slot(slotData2).save();
      await new Slot(slotData3).save();

      const capacity4Slots = await Slot.find({ capacity: 4 });
      expect(capacity4Slots).toHaveLength(2);

      const capacity6Slots = await Slot.find({ capacity: 6 });
      expect(capacity6Slots).toHaveLength(1);
    });

    it('should find slots with expired reservations', async () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now

      const slotData1 = {
        slotNumber: 1,
        number: 5,
        capacity: 4,
        reserved: true,
        reservationExpiry: pastDate
      };

      const slotData2 = {
        slotNumber: 1,
        number: 6,
        capacity: 4,
        reserved: true,
        reservationExpiry: futureDate
      };

      await new Slot(slotData1).save();
      await new Slot(slotData2).save();

      const expiredReservations = await Slot.find({
        reservationExpiry: { $lt: new Date() }
      });

      expect(expiredReservations).toHaveLength(1);
      expect(expiredReservations[0].number).toBe(5);
    });
  });
});
