import { User, IUser } from '../models/user.model';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  async getAllUsers(): Promise<IUser[]> {
    return await User.find();
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  async deleteUser(id: string): Promise<void> {
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      throw new AppError('User not found', 404);
    }
  }
}
