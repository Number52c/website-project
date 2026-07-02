import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { carriers } from './drizzle/schema';
import * as dotenv from 'dotenv';

dotenv.config();

const sampleCarriers = [
  {
    name: 'American General Life Insurance Company',
    shortName: 'AGL',
    type: 'life' as const,
    phone: '1-800-AGL-LIFE',
    portalUrl: 'https://www.agl.com/agent-portal',
    active: 1,
  },
  {
    name: 'Equitable Life Insurance Company',
    shortName: 'ELCO',
    type: 'life' as const,
    phone: '1-800-EQUITABLE',
    portalUrl: 'https://www.equitable.com/agents',
    active: 1,
  },
  {
    name: 'Athene Holding Ltd',
    shortName: 'Athene',
    type: 'annuity' as const,
    phone: '1-844-ATHENE-1',
    portalUrl: 'https://www.athene.com/producer-portal',
    active: 1,
  },
  {
    name: 'Voya Retirement Insurance and Annuity Company',
    shortName: 'Voya',
    type: 'annuity' as const,
    phone: '1-888-VOYA-401',
    portalUrl: 'https://www.voya.com/producer',
    active: 1,
  },
  {
    name: 'Lincoln National Life Insurance Company',
    shortName: 'Lincoln',
    type: 'life' as const,
    phone: '1-888-LINCOLN',
    portalUrl: 'https://www.lincolnfinancial.com/producer',
    active: 1,
  },
  {
    name: 'Principal Life Insurance Company',
    shortName: 'Principal',
    type: 'life' as const,
    phone: '1-800-PRINCIPAL',
    portalUrl: 'https://www.principal.com/agents',
    active: 1,
  },
];

async function populateCarriers() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection);

    console.log('Populating carriers table...');
    
    for (const carrier of sampleCarriers) {
      try {
        await db.insert(carriers).values(carrier);
        console.log(`✓ Inserted: ${carrier.name}`);
      } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠ Already exists: ${carrier.name}`);
        } else {
          throw err;
        }
      }
    }

    console.log('✓ Carriers table populated successfully');
    await connection.end();
  } catch (error) {
    console.error('Error populating carriers:', error);
    process.exit(1);
  }
}

populateCarriers();
