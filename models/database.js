const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/guy';

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
    'CREATE TABLE raindrop(id SERIAL PRIMARY KEY, stamp TIMESTAMP not null, filename VARCHAR(40), sourceid integer)');
query.on('end', () => { client.end(); });
