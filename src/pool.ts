import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  host: 'localhost',
  database: 'social_media_db',
  password: '1234qwerty',
  port: 5432,
});

export default pool;