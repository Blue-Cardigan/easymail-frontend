import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!apiUrl || !apiKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(apiUrl, apiKey)

// Helper function to handle Supabase errors
const handleSupabaseError = (error) => {
    console.error('Supabase error:', error)
    // You can add more error handling logic here
    throw error
  }

const BATCH_SIZE = 1000; // Adjust this value based on your needs

const importPostcodes = async () => {
  const results = [];
  let batch = [];

  const processBatch = async (batch) => {
    try {
      const { data, error } = await supabase
        .from('postcodes')
        .upsert(batch, { onConflict: 'postcode' });
      
      if (error) handleSupabaseError(error);
      else console.log('Batch processed:', batch.length, 'records');
    } catch (error) {
      handleSupabaseError(error);
    }
  };

  await new Promise((resolve, reject) => {
    fs.createReadStream('lib/pcd-constituency.csv')
      .pipe(csv())
      .on('data', (data) => {
        if (data.pcd <= 'CF40 2PA') {
          batch.push({ postcode: data.pcd, constituency: data.pconnm });
          if (batch.length >= BATCH_SIZE) {
            processBatch(batch);
            batch = [];
          }
        }
      })
      .on('end', async () => {
        if (batch.length > 0) {
          await processBatch(batch);
        }
        console.log('Import completed');
        resolve();
      })
      .on('error', reject);
  });
};

importPostcodes().catch(console.error);