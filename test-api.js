async function test() {
  const res = await fetch("https://ij78z9ah.ap-southeast.insforge.app/auth/v1/signup", {
    method: 'POST',
    body: JSON.stringify({email: "test@test.com", password: "password"}),
    headers: { 
      'Content-Type': 'application/json',
      'apikey': 'ik_59aeeb7aa1403d45694f006d4606068b',
      'Authorization': 'Bearer ik_59aeeb7aa1403d45694f006d4606068b'
    }
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Text:", text.substring(0, 200));
}
test();
