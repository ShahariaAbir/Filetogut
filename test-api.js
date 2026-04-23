async function test() {
  const res = await fetch("https://ij78z9ah.ap-southeast.insforge.app/api/upload", {
    method: 'POST'
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Text:", text.substring(0, 200));
}
test();
