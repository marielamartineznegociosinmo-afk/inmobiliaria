import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });

async function main() {
  await client.connect();
  try {
    console.log('Connected to DB, seeding...');
    // Ensure tables exist (DDL compatible with Drizzle schema)
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id serial PRIMARY KEY,
        username text NOT NULL UNIQUE,
        password_hash text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id serial PRIMARY KEY,
        title text NOT NULL,
        description text,
        type text NOT NULL,
        operation text NOT NULL,
        price real NOT NULL,
        currency text NOT NULL DEFAULT 'USD',
        neighborhood text NOT NULL,
        address text NOT NULL,
        city text NOT NULL DEFAULT 'Paraná',
        bedrooms integer,
        bathrooms integer,
        covered_area real,
        total_area real,
        garage boolean,
        age integer,
        additional_features text,
        photos text[] NOT NULL DEFAULT ARRAY[]::text[],
        cover_photo text,
        featured boolean NOT NULL DEFAULT false,
        active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // Seed admin (uses known bcrypt hash for 'password')
    await client.query(`
      INSERT INTO admins (username, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi']);

    // Seed a few properties
    await client.query(`
      INSERT INTO properties (title, description, type, operation, price, currency, neighborhood, address, city, bedrooms, bathrooms, covered_area, total_area, garage, age, additional_features, photos, cover_photo, featured, active)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      ON CONFLICT DO NOTHING
    `, [
      'Departamento céntrico',
      'Cómodo departamento a pasos del centro, ideal inversión',
      'Departamento',
      'Venta',
      95000,
      'USD',
      'Centro',
      'Calle Falsa 123',
      'Paraná',
      2,
      1,
      50,
      60,
      true,
      5,
      'Balcón, Luminoso',
      ['uploads/img1.jpg','uploads/img2.jpg'],
      'uploads/img1.jpg',
      true,
      true
    ]);

    await client.query(`
      INSERT INTO properties (title, description, type, operation, price, currency, neighborhood, address, city, bedrooms, bathrooms, covered_area, total_area, garage, age, additional_features, photos, cover_photo, featured, active)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      ON CONFLICT DO NOTHING
    `, [
      'Casa en barrio residencial',
      'Casa familiar con amplio jardín y garaje',
      'Casa',
      'Venta',
      150000,
      'USD',
      'Barrio Norte',
      'Avenida Siempre Viva 742',
      'Paraná',
      3,
      2,
      120,
      250,
      true,
      10,
      'Jardín, Parrilla',
      ['uploads/house1.jpg'],
      'uploads/house1.jpg',
      false,
      true
    ]);

    console.log('Seeding done');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
