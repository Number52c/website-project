import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { carriers } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

let db: any;
let connection: any;

beforeAll(async () => {
  connection = await mysql.createConnection(process.env.DATABASE_URL!);
  db = drizzle(connection);
});

afterAll(async () => {
  await connection.end();
});

describe('Carrier Management', () => {
  let testCarrierId: number;

  it('should add a new carrier', async () => {
    const result = await db.insert(carriers).values({
      name: 'Test Carrier Inc',
      portalUrl: 'https://test-carrier.com/portal',
      website: 'https://test-carrier.com',
    });

    expect(result).toBeDefined();
    
    // Retrieve the inserted carrier
    const [inserted] = await db
      .select()
      .from(carriers)
      .where(eq(carriers.name, 'Test Carrier Inc'))
      .limit(1);

    expect(inserted).toBeDefined();
    expect(inserted.name).toBe('Test Carrier Inc');
    expect(inserted.portalUrl).toBe('https://test-carrier.com/portal');
    expect(inserted.website).toBe('https://test-carrier.com');
    
    testCarrierId = inserted.id;
  });

  it('should retrieve all carriers', async () => {
    const allCarriers = await db.select().from(carriers);
    
    expect(Array.isArray(allCarriers)).toBe(true);
    expect(allCarriers.length).toBeGreaterThan(0);
    
    // Verify our test carrier is in the list
    const testCarrier = allCarriers.find((c: any) => c.name === 'Test Carrier Inc');
    expect(testCarrier).toBeDefined();
  });

  it('should update a carrier', async () => {
    await db
      .update(carriers)
      .set({
        portalUrl: 'https://updated-test-carrier.com/portal',
        website: 'https://updated-test-carrier.com',
      })
      .where(eq(carriers.id, testCarrierId));

    const [updated] = await db
      .select()
      .from(carriers)
      .where(eq(carriers.id, testCarrierId))
      .limit(1);

    expect(updated.portalUrl).toBe('https://updated-test-carrier.com/portal');
    expect(updated.website).toBe('https://updated-test-carrier.com');
  });

  it('should delete a carrier', async () => {
    await db.delete(carriers).where(eq(carriers.id, testCarrierId));

    const [deleted] = await db
      .select()
      .from(carriers)
      .where(eq(carriers.id, testCarrierId))
      .limit(1);

    expect(deleted).toBeUndefined();
  });

  it('should prevent duplicate carrier names', async () => {
    // Insert first carrier
    await db.insert(carriers).values({
      name: 'Duplicate Test Carrier',
      portalUrl: 'https://dup1.com/portal',
      website: 'https://dup1.com',
    });

    // Try to insert duplicate - should fail
    try {
      await db.insert(carriers).values({
        name: 'Duplicate Test Carrier',
        portalUrl: 'https://dup2.com/portal',
        website: 'https://dup2.com',
      });
      expect.fail('Should have thrown duplicate entry error');
    } catch (error: any) {
      expect(error.code).toBe('ER_DUP_ENTRY');
    }

    // Clean up
    await db.delete(carriers).where(eq(carriers.name, 'Duplicate Test Carrier'));
  });

  it('should handle optional fields', async () => {
    const result = await db.insert(carriers).values({
      name: 'Minimal Carrier',
      // portalUrl and website are optional
    });

    const [inserted] = await db
      .select()
      .from(carriers)
      .where(eq(carriers.name, 'Minimal Carrier'))
      .limit(1);

    expect(inserted).toBeDefined();
    expect(inserted.name).toBe('Minimal Carrier');
    expect(inserted.portalUrl).toBeNull();
    expect(inserted.website).toBeNull();

    // Clean up
    await db.delete(carriers).where(eq(carriers.id, inserted.id));
  });

  it('should retrieve carrier by name', async () => {
    // Use one of the sample carriers we populated
    const [carrier] = await db
      .select()
      .from(carriers)
      .where(eq(carriers.name, 'American General Life Insurance Company'))
      .limit(1);

    expect(carrier).toBeDefined();
    expect(carrier.name).toBe('American General Life Insurance Company');
    expect(carrier.portalUrl).toBe('https://www.agl.com/agent-portal');
  });
});
