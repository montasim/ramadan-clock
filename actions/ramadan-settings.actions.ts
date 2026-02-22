'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

/**
 * Get Ramadan settings from database
 * If no settings exist, creates default settings
 */
export async function getRamadanSettings() {
  try {
    let settings = await prisma.ramadanSettings.findFirst()
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.ramadanSettings.create({
        data: {
          startDate: '', // Will be set by admin
          endDate: '',   // Will be set by admin
        }
      })
    }
    
    return {
      success: true,
      startDate: settings.startDate,
      endDate: settings.endDate,
    }
  } catch (error) {
    console.error('Error fetching Ramadan settings:', error)
    return {
      success: false,
      error: 'Failed to fetch Ramadan settings',
      startDate: '',
      endDate: '',
    }
  }
}

/**
 * Update Ramadan settings
 * Validates dates and stores them in the database
 */
export async function updateRamadanSettings(startDate: string, endDate: string) {
  try {
    // Validate dates
    if (!startDate || !endDate) {
      return {
        success: false,
        error: 'Start date and end date are required',
      }
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return {
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD format',
      }
    }
    
    // Validate that end date is after start date
    if (new Date(endDate) < new Date(startDate)) {
      return {
        success: false,
        error: 'End date must be after start date',
      }
    }
    
    // Get or create settings
    let settings = await prisma.ramadanSettings.findFirst()
    
    if (settings) {
      // Update existing settings
      settings = await prisma.ramadanSettings.update({
        where: { id: settings.id },
        data: { startDate, endDate },
      })
    } else {
      // Create new settings
      settings = await prisma.ramadanSettings.create({
        data: { startDate, endDate },
      })
    }
    
    // Revalidate cache
    revalidatePath('/admin/dashboard')
    
    return {
      success: true,
      startDate: settings.startDate,
      endDate: settings.endDate,
    }
  } catch (error) {
    console.error('Error updating Ramadan settings:', error)
    return {
      success: false,
      error: 'Failed to update Ramadan settings',
    }
  }
}
