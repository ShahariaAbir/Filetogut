async function check() {
  try {
    const res = await fetch("https://ij78z9ah.ap-southeast.insforge.app/rest/v1/");
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Text:", text.substring(0, 500));
  } catch (e) {
    console.error(e);
  }
}
check();
