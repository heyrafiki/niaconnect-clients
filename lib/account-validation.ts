import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

// Define minimal Expert schema for validation only
const ExpertSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
});

// Only used for validation, won't affect the main Expert model
const ExpertValidation = mongoose.models.Expert || mongoose.model('Expert', ExpertSchema);

export async function validateClientEmail(email: string): Promise<NextResponse | null> {
  try {
    // Check if email exists in experts collection
    const expertExists = await ExpertValidation.findOne({ email });
    
    if (expertExists) {
      return NextResponse.json(
        { 
          error: 'This email is already registered as an expert. Please use a different email or sign in to your expert account.' 
        }, 
        { status: 409 }
      );
    }
    
    return null; // No conflict found
  } catch (error) {
    console.error('Error validating client email:', error);
    return null; // Proceed with signup in case of error
  }
} 