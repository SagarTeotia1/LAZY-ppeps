import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();

    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            'Electronics',
            'Fashion',
            'Home & Kitchen',
            'Sport & Fitness',
          ],
          subCategories: {
              'Electronics': ['Mobiles', 'Laptops', 'Cameras'],
              "Fashion": ['Men', 'Women', 'Kids'],
              'Home & Kitchen': ['Furniture', 'Decor', 'Appliances'],
              'Sport & Fitness': ['Gym Equipment', 'Outdoor', 'Clothing'],
          },
        },
      });

      
    } 
  } catch (error) {
    console.error('Error initializing config:', error);
  } 
};

export default initializeSiteConfig;
