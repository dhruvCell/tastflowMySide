const mongoose = require('mongoose');
const Food = require('../../models/FoodModel');

describe('Food Model', () => {
  describe('Food Schema Validation', () => {
    it('should create a food item with all required fields', async () => {
      const foodData = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch'
      };

      const food = new Food(foodData);
      const savedFood = await food.save();

      expect(savedFood._id).toBeDefined();
      expect(savedFood.name).toBe(foodData.name);
      expect(savedFood.description).toBe(foodData.description);
      expect(savedFood.price).toBe(foodData.price);
      expect(savedFood.category).toBe(foodData.category);
      expect(savedFood.image).toBe(foodData.image);
      expect(savedFood.mealType).toBe(foodData.mealType);
      expect(savedFood.date).toBeDefined();
    });

    it('should fail to create food without required name field', async () => {
      const foodData = {
        description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch'
      };

      const food = new Food(foodData);

      await expect(food.save()).rejects.toThrow(/name.*required/i);
    });

    it('should fail to create food without required description field', async () => {
      const foodData = {
        name: 'Pizza Margherita',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch'
      };

      const food = new Food(foodData);

      await expect(food.save()).rejects.toThrow(/description.*required/i);
    });

    it('should fail to create food without required price field', async () => {
      const foodData = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch'
      };

      const food = new Food(foodData);

      await expect(food.save()).rejects.toThrow(/price.*required/i);
    });

    it('should fail to create food without required category field', async () => {
      const foodData = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch'
      };

      const food = new Food(foodData);

      await expect(food.save()).rejects.toThrow(/category.*required/i);
    });

    it('should fail to create food without required image field', async () => {
      const foodData = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Italian',
        mealType: 'Lunch'
      };

      const food = new Food(foodData);

      await expect(food.save()).rejects.toThrow(/image.*required/i);
    });

    it('should fail to create food without required mealType field', async () => {
      const foodData = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg'
      };

      const food = new Food(foodData);

      await expect(food.save()).rejects.toThrow(/mealType.*required/i);
    });

    it('should fail to create food with invalid mealType', async () => {
      const foodData = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Snack'
      };

      const food = new Food(foodData);

      await expect(food.save()).rejects.toThrow(/not a valid enum value/i);
    });

    it('should create food with valid mealType values', async () => {
      const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

      for (const mealType of mealTypes) {
        const foodData = {
          name: `Test Food ${mealType}`,
          description: 'Test description',
          price: 10.99,
          category: 'Test',
          image: 'test.jpg',
          mealType: mealType
        };

        const food = new Food(foodData);
        const savedFood = await food.save();

        expect(savedFood.mealType).toBe(mealType);
      }
    });
  });

  describe('Food Schema Optional Fields', () => {
    it('should create food with ingredients array', async () => {
      const foodData = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch',
        ingredients: ['Tomato Sauce', 'Mozzarella Cheese', 'Basil', 'Olive Oil']
      };

      const food = new Food(foodData);
      const savedFood = await food.save();

      expect(savedFood.ingredients).toEqual(foodData.ingredients);
    });

    it('should create food with preparation steps array', async () => {
      const foodData = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch',
        preparationSteps: [
          'Preheat oven to 475°F',
          'Roll out the dough',
          'Add tomato sauce and toppings',
          'Bake for 12-15 minutes'
        ]
      };

      const food = new Food(foodData);
      const savedFood = await food.save();

      expect(savedFood.preparationSteps).toEqual(foodData.preparationSteps);
    });

    it('should create food with nutritional info', async () => {
      const foodData = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch',
        nutritionalInfo: {
          calories: 250,
          protein: 12,
          carbohydrates: 30,
          fat: 8,
          fiber: 3,
          sugar: 5
        }
      };

      const food = new Food(foodData);
      const savedFood = await food.save();

      expect(savedFood.nutritionalInfo.calories).toBe(foodData.nutritionalInfo.calories);
      expect(savedFood.nutritionalInfo.protein).toBe(foodData.nutritionalInfo.protein);
      expect(savedFood.nutritionalInfo.carbohydrates).toBe(foodData.nutritionalInfo.carbohydrates);
      expect(savedFood.nutritionalInfo.fat).toBe(foodData.nutritionalInfo.fat);
      expect(savedFood.nutritionalInfo.fiber).toBe(foodData.nutritionalInfo.fiber);
      expect(savedFood.nutritionalInfo.sugar).toBe(foodData.nutritionalInfo.sugar);
    });

    it('should create food with similar dishes array', async () => {
      const foodData = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch',
        similarDishes: [
          {
            name: 'Pizza Pepperoni',
            image: 'pizza-pepperoni.jpg',
            category: 'Italian'
          },
          {
            name: 'Pizza Quattro Stagioni',
            image: 'pizza-quattro.jpg',
            category: 'Italian'
          }
        ]
      };

      const food = new Food(foodData);
      const savedFood = await food.save();

      expect(savedFood.similarDishes).toHaveLength(2);
      expect(savedFood.similarDishes[0].name).toBe('Pizza Pepperoni');
      expect(savedFood.similarDishes[1].name).toBe('Pizza Quattro Stagioni');
    });

    it('should set default values for optional fields', async () => {
      const foodData = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch'
      };

      const food = new Food(foodData);
      const savedFood = await food.save();

      expect(savedFood.ingredients).toEqual([]);
      expect(savedFood.preparationSteps).toEqual([]);
      expect(savedFood.nutritionalInfo.calories).toBe(0);
      expect(savedFood.nutritionalInfo.protein).toBe(0);
      expect(savedFood.nutritionalInfo.carbohydrates).toBe(0);
      expect(savedFood.nutritionalInfo.fat).toBe(0);
      expect(savedFood.nutritionalInfo.fiber).toBe(0);
      expect(savedFood.nutritionalInfo.sugar).toBe(0);
      expect(savedFood.similarDishes).toEqual([]);
    });
  });

  describe('Food Model Methods', () => {
    it('should have correct model name', () => {
      expect(Food.modelName).toBe('Food');
    });

    it('should create multiple food items', async () => {
      const foodData1 = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch'
      };

      const foodData2 = {
        name: 'Burger',
        description: 'Classic American burger',
        price: 8.99,
        category: 'American',
        image: 'burger.jpg',
        mealType: 'Lunch'
      };

      const food1 = new Food(foodData1);
      const food2 = new Food(foodData2);

      await food1.save();
      await food2.save();

      const foods = await Food.find({});
      expect(foods).toHaveLength(2);
    });

    it('should find food by category', async () => {
      const foodData1 = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch'
      };

      const foodData2 = {
        name: 'Burger',
        description: 'Classic American burger',
        price: 8.99,
        category: 'American',
        image: 'burger.jpg',
        mealType: 'Lunch'
      };

      await new Food(foodData1).save();
      await new Food(foodData2).save();

      const italianFoods = await Food.find({ category: 'Italian' });
      expect(italianFoods).toHaveLength(1);
      expect(italianFoods[0].name).toBe('Pizza Margherita');
    });

    it('should find food by meal type', async () => {
      const foodData1 = {
        name: 'Pancakes',
        description: 'Fluffy pancakes',
        price: 6.99,
        category: 'Breakfast',
        image: 'pancakes.jpg',
        mealType: 'Breakfast'
      };

      const foodData2 = {
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza',
        price: 12.99,
        category: 'Italian',
        image: 'pizza-margherita.jpg',
        mealType: 'Lunch'
      };

      await new Food(foodData1).save();
      await new Food(foodData2).save();

      const breakfastFoods = await Food.find({ mealType: 'Breakfast' });
      expect(breakfastFoods).toHaveLength(1);
      expect(breakfastFoods[0].name).toBe('Pancakes');
    });
  });
});
