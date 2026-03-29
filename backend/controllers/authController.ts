import User from "../models/User.js";
import UserPreference from "../models/UserPreference.js";
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface UserType {
  id: string | number;
  email: string;
  name: string;
  password_hash?: string;
}

const generateToken = (user: UserType) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
  
  return jwt.sign(
    { id: user.id, email: user.email },
    secret,
    { expiresIn: '30d' }
  );
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and name'
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

const user = (await User.create({ email, password, name })) as unknown as UserType;

    await UserPreference.upsert(user.id, {
      dietary_restrictions: [],
      allergies: [],
      preferred_cuisines: [],
      default_servings: 4,
      measurement_unit: 'metric'
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

const user = (await User.findByEmail(email)) as unknown as UserType;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await User.verifyPassword(password, user.password_hash || '');
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Получение данных текущего авторизованного пользователя
export const getCurrentUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    // req.user берется из middleware auth.ts
    const user = await User.findById(req.user.id) as unknown as UserType;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: { 
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    return res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    });
  } catch (error) {
    next(error);
  }
};