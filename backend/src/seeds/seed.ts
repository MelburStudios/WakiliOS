import bcrypt from 'bcryptjs';
import Settings from '../models/settings.model';
import { User } from '../models/user.model';
import mongoose from 'mongoose';
import { config } from '../config/config';

export const seedAdmin = async (adminInfo:any) => {
  try {
    console.log('🌱 Starting seed process...');

    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState === 0) {
      console.log('📡 Connecting to MongoDB...');
      await mongoose.connect(config.mongoUri || 'mongodb://localhost:27017/legal-services');
      console.log('✅ Connected to MongoDB');
    }

    // Delete existing test users
    console.log('🧹 Cleaning up existing test users...');
    await User.deleteMany({ 
      email: { 
        $in: [
          'admin@lawfirm.com',
          'user@lawfirm.com',
          'attorney@lawfirm.com'
        ] 
      } 
    });

    // Create test users
    const users = [
      {
        name: 'Test User',
        email: 'user@lawfirm.com',
        password: 'User@123',
        role: 'user',
        status: 'active',
        phone_no: '+1234567890',
        country: 'United States',
        postal_code: '12345',
        pre_address: '123 Test Street, City, State'
      },
      {
        name: 'Test Attorney',
        email: 'attorney@lawfirm.com',
        password: 'Attorney@123',
        role: 'attorney',
        status: 'active',
        phone_no: '+1987654321',
        country: 'United States',
        postal_code: '54321',
        pre_address: '456 Law Street, City, State',
        specialization: ['Criminal Law', 'Family Law'],
        bio: 'Experienced attorney with expertise in criminal and family law.',
        experience: 5,
        languages: ['English', 'Spanish'],
        active_cases: 3,
        pending_cases: 2,
        availability: {
           date: "2025-04-09",
           timeSlots: ["14:00", "15:00", "16:00"],
           bookingSlots: ["14:00"]
        }
      }
    ];
    adminInfo.role = 'admin';
    adminInfo.status = 'active';
    users.push(adminInfo);
    // Create users
    for (const userData of users) {
      try {
        const user = await User.create(userData);
        console.log(`✅ Created ${userData.role} successfully:`, {
          id: user._id,
          email: user.email,
          role: user.role
        });
      } catch (error: any) {
        console.error(`❌ Failed to create ${userData.role}:`, error.message);
        throw new Error(`User creation failed: ${error.message}`);
      }
    }

    // Store credentials in a separate log for reference
    console.log('🔐 Test Credentials (Save these):', {
      admin: { email: 'admin@lawfirm.com', password: 'Admin@123' },
      user: { email: 'user@lawfirm.com', password: 'User@123' },
      attorney: { email: 'attorney@lawfirm.com', password: 'Attorney@123' }
    });

    // Check and create settings
    try {
      const settingsExist = await Settings.findOne();
      
      if (!settingsExist) {
        console.log('📝 Creating default settings...');
        await Settings.create({
            title: 'Professional Legal Services',
            description: 'Expert legal services for all your needs',
            email: 'contact@lawfirm.com',
            phone: '+1234567890',
            address: '123 Law Street, City, Country',
            copyright: `© ${new Date().getFullYear()} Law Firm. All rights reserved.`,
            currency_code:"USD",
            currency_symbol:"$",
            social_media: {
              facebook: 'https://facebook.com/lawfirm',
              twitter: 'https://twitter.com/lawfirm',
              instagram: 'https://instagram.com/lawfirm',
              linkedin: 'https://linkedin.com/company/lawfirm'
            }
        });
        
        console.log('✅ Default settings created successfully');
      } else {
        console.log('ℹ️ Settings already exist, skipping creation');
      }
    } catch (error: any) {
      console.error('❌ Failed to create settings:', error.message);
      throw new Error(`Settings creation failed: ${error.message}`);
    }

    console.log('🌱 Seed completed successfully');
    
  } catch (error: any) {
    console.error('❌ Seed failed:', error.message);
    throw error;
  }
};

// Create a script to run the seed
// if (require.main === module) {
//   seedAdmin()
//     .then(() => {
//       console.log('🏁 Seeding completed, you can now start the application');
//       process.exit(0);
//     })
//     .catch((error) => {
//       console.error('💥 Seeding failed:', error);
//       process.exit(1);
//     });
// } 