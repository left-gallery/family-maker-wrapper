const https = require("https");
const fs = require("fs");
const path = require("path");

const VERSION = "soljson-v0.4.26+commit.4563c3fc.js";
const URL = "https://binaries.soliditylang.org/bin/" + VERSION;
const DEST = path.join(__dirname, VERSION);

https.get(URL, (res) => {
  const ws = fs.createWriteStream(DEST);
  res.pipe(ws);
  ws.on("finish", () => {
    ws.close();
    console.log(`Solidity compiler ${VERSION} downloaded successfully`);
  });
});
