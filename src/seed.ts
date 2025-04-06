import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users/schemas/user.schema';
import { Hoagie } from './hoagies/schemas/hoagie.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Get model references directly from the app context
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const hoagieModel = app.get<Model<Hoagie>>(getModelToken(Hoagie.name));
  
  // Clear existing data
  await userModel.deleteMany({});
  await hoagieModel.deleteMany({});
  
  console.log('Data cleared');
  
  // Define users
  const users = [
    { name: 'Alice Johnson', email: 'alice@example.com' },
    { name: 'Bob Smith', email: 'bob@example.com' },
    { name: 'Charlie Davis', email: 'charlie@example.com' },
    { name: 'Diana Miller', email: 'diana@example.com' },
    { name: 'Edward Wilson', email: 'edward@example.com' },
  ];
  
  // Available hoagie images
  const hoagieImages = [
    'https://neuroticmommy.com/wp-content/uploads/2015/08/healthified-super-veggie-hoagie4.jpg',
    'https://veginspired.com/wp-content/uploads/IMG_9368.jpg',
    'https://imagedelivery.net/olI9wp0b6luWFB9nPfnqjQ/res/abillionveg/image/upload/uo54k9o7ozoy0ol2egkm/1609355733.jpg/w=640,quality=75',
    'https://mysubway.ro/wp-content/uploads/2019/08/Spicy-vegan-02.jpg',
  ];
  
  // Hoagie ingredient options
  const ingredientsList = [
    ['Lettuce', 'Tomato', 'Onion', 'Bell Pepper', 'Cucumber'],
    ['Spinach', 'Avocado', 'Sprouts', 'Mushrooms', 'Olives'],
    ['Hummus', 'Tofu', 'Chickpeas', 'Eggplant', 'Zucchini'],
    ['Pesto', 'Vegan Cheese', 'Artichoke', 'Sun-dried Tomatoes', 'Arugula'],
    ['Pickles', 'Jalapeños', 'Vegan Mayo', 'Mustard', 'Balsamic Glaze'],
  ];
  
  // Create users
  const createdUsers: UserDocument[] = [];
  for (const userData of users) {
    const user = new userModel(userData);
    const savedUser = await user.save();
    createdUsers.push(savedUser);
    console.log(`Created user: ${userData.name}`);
  }
  
  // Create hoagies for each user
  for (const user of createdUsers) {
    for (let i = 0; i < 5; i++) {
      // Get random image
      const randomImage = hoagieImages[Math.floor(Math.random() * hoagieImages.length)];
      
      // Get random ingredients set
      const randomIngredients = ingredientsList[Math.floor(Math.random() * ingredientsList.length)];
      
      const hoagie = new hoagieModel({
        name: `${user.name.split(' ')[0]}'s Hoagie #${i + 1}`,
        ingredients: randomIngredients,
        picture: randomImage,
        creator: user._id,
        commentCount: 0,
      });
      
      await hoagie.save();
      console.log(`Created hoagie: ${hoagie.name} for user ${user.name}`);
    }
  }
  
  console.log('Seeding completed successfully!');
  await app.close();
}

bootstrap().catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
}); 