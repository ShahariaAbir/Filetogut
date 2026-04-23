async function test() {
  const res = await fetch("https://ij78z9ah.ap-southeast.insforge.app/api/docs");
  const text = await res.text();
  console.log(text.substring(0, 1000));
}
test();
