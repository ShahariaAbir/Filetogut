const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDU2NDF9.955-GFUR2hChdHswWypeNi3swpvEyBTZGd100IP9k38";
const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());
console.log(payload);
