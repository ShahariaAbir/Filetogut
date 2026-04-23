import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ij78z9ah.ap-southeast.insforge.app';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDU2NDF9.955-GFUR2hChdHswWypeNi3swpvEyBTZGd100IP9k38';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
