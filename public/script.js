document.addEventListener("DOMContentLoaded", async () => {
  const bbsInfoDiv = document.getElementById("bbs-info");

  try {
    const response = await fetch("/bbs/info");
    const data = await response.text();
    bbsInfoDiv.innerHTML = `<pre>${data}</pre>`;
  } catch (error) {
    bbsInfoDiv.innerHTML = "掲示板の情報を取得できませんでした。";
  }
});