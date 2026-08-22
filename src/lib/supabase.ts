import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://ozzoryuxsudjijpksopu.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQwNTQ5ZDdmLWM0MjUtNDliZC1hNzFhLTIyYjg1MTNmZTQ3NyJ9.eyJwcm9qZWN0SWQiOiJvenpvcnl1eHN1ZGppanBrc29wdSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg2NDczNjUyLCJleHAiOjIxMDE4MzM2NTIsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.EDxm6taMMoMZUgyDwFioq_7iNQKdlmbtSC-EE8W63xw';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };