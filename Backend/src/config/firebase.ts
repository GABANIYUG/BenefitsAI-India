import admin from 'firebase-admin'

if (!admin.apps.length) {
  // Try to initialize using the standard Firebase Admin environment variable
  // GOOGLE_APPLICATION_CREDENTIALS path to service account json
  try {
    admin.initializeApp()
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error)
  }
}

export const auth = admin.auth()
export const db = admin.firestore() // If needed alongside Prisma

export default admin
