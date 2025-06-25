// index.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://piodxpzalyasrcfcytti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpb2R4cHphbHlhc3JjZmN5dHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjI3MTcsImV4cCI6MjA2NjMzODcxN30.c6WV2GKBVPKXw7U6Tgb6vz3t4miLo__d5jPHw9r5VoY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  // Test the connection
  const { data: testData, error: testError } = await supabase.from('emails').select('*').limit(1);
  if (testError) {
    console.error('Error selecting record:', testError);
  } else {
    console.log('Test select result:', testData);
  }

  // Insert a record
  console.log('Inserting record...');
  const { data, error } = await supabase
    .from('emails')
    .insert([{
      email_content: 'This is my first test email!',
      sentiment: 'neutral',
      summary: 'Test summary',
      is_repeated_issue: false
    }])
    .select();

  if (error) {
    console.error('Error inserting record:', error); // show full error
  } else {
    console.log('Inserted record:', data);
  }
})();
