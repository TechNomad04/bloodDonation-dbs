import dotenv from 'dotenv'
dotenv.config()
export const PORT = process.env.PORT || 5000
export const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://agarwalsamiksha88_db_user:HI123@cluster0.apgknf5.mongodb.net/?appName=Cluster0'
export const JWT_SECRET = process.env.JWT_SECRET || 'changeme'
export const SEED_SUPERADMIN_EMAIL = process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@example.com'
export const SEED_SUPERADMIN_PASSWORD = process.env.SEED_SUPERADMIN_PASSWORD || 'superadmin123'


