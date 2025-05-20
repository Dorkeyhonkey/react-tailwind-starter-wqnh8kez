import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./shared/schema";
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

neonConfig.webSocketConstructor = ws;

const main = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }

  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Creating tables...");
  try {
    // Test using simple query first
    const result = await pool.query('SELECT 1 as test');
    console.log("Database connection successful:", result.rows[0]);

    // Execute create table statements manually
    console.log("Creating users table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Creating vaults table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vaults (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        cover_image TEXT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        encryption_level TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    console.log("Creating recipients table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        notification_preferences JSONB
      );
    `);

    console.log("Creating content_items table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        content_type TEXT NOT NULL,
        content_path TEXT NOT NULL,
        vault_id INTEGER NOT NULL REFERENCES vaults(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        encryption_key TEXT,
        thumbnail_url TEXT,
        metadata JSONB
      );
    `);

    console.log("Creating deliveries table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id SERIAL PRIMARY KEY,
        content_item_id INTEGER NOT NULL REFERENCES content_items(id),
        recipient_id INTEGER NOT NULL REFERENCES recipients(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        scheduled_date TIMESTAMP,
        trigger_condition TEXT,
        is_delivered BOOLEAN DEFAULT FALSE,
        delivered_at TIMESTAMP,
        delivery_method TEXT DEFAULT 'email',
        additional_notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Creating activities table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        details JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log("All tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  } finally {
    await pool.end();
  }
};

main()
  .then(() => {
    console.log("Schema push completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Schema push failed:", err);
    process.exit(1);
  });