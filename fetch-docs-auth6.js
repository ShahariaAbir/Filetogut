async function fetchDocs() {
  const res = await fetch("https://ij78z9ah.ap-southeast.insforge.app/api/docs/auth-sdk");
  const text = await res.text();
  console.log(text.substring(15000, 18000));
}
fetchDocs();
