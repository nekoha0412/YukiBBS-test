const express = require("express");
const axios = require("axios");
const path = require("path");
const cache = require("memory-cache");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = "https://yukibbs-server.onrender.com/";

const CACHE_DURATION = 5000;

app.use(compression());
app.use(cookieParser()); 
app.use(express.static("public")); 
app.set("view engine", "ejs"); 
app.set("views", path.join(__dirname, "views"));

//  `/bbs` にリダイレクト
app.get("/", (req, res) => {
  res.redirect("/bbs");
});

// 掲示板のHTMLを表示
app.get("/bbs", (req, res) => {
  res.render("bbs");
});

app.get("/bbs/api", async (req, res) => {
  const { t, channel = "main", verify = "false" } = req.query;
  const cacheKey = `bbsapi-${channel}-${verify}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    console.log("Returning cached data");
    return res.send(cachedData);
  }

  try {
    const url = `${API_URL}bbs/api?t=${encodeURIComponent(t)}&verify=${encodeURIComponent(verify)}&channel=${encodeURIComponent(channel)}`;
    console.log("Fetching from API:", url);
    const response = await axios.get(url, { headers: { Cookie: "yuki=True" } });

    cache.put(cacheKey, response.data, CACHE_DURATION); 
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching BBS API:", error.message);
    res.status(500).send("Error fetching BBS API");
  }
});

app.get("/bbs/result", async (req, res) => {
  const { name, message, seed, channel = "main", verify = "false" } = req.query;

const decodedMessage = decodeURIComponent(escape(Buffer.from(message, 'base64').toString('binary')));


  console.log(`name: ${name}, channel: ${channel}, message: ${decodedMessage}`);

    try {
    const response = await axios.get(`${API_URL}bbs/result`, {
      params: {
        name,
        message: decodedMessage,
        seed,
        channel,
        verify,
        info: "" 
      },
      headers: { Cookie: "yuki=True" },
      allowRedirects: false 
    });

    if (response.status === 307) {
      return res.redirect(`/bbs?name=${encodeURIComponent(name)}&seed=${encodeURIComponent(seed)}&channel=${encodeURIComponent(channel)}&verify=${encodeURIComponent(verify)}`);
    }

    if (typeof response.data === 'object') {
      res.json(response.data); 
    } else {
      res.send(response.data);
    }

  } catch (error) {
    console.error("Error sending result:", error);

    res.status(500).send("メッセージ送信に失敗しました");
  }
});　

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});