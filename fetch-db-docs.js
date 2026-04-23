async function fetchDocs() {
  const res = await fetch("https://ij78z9ah.ap-southeast.insforge.app/api/docs/database-sdk");
  const text = await res.text();
  console.log(text.substring(0, 3000));
}
fetchDocs();
