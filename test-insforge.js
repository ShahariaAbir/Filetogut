async function test() {
  const res = await fetch("https://insforge.dev");
  const text = await res.text();
  console.log(text.substring(0, 1000));
}
test();
