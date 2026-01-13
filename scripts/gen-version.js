const fs = require("fs");
const path = require("path");

const version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || Date.now();
const filePath = path.join(__dirname, "../public/version.json");

fs.writeFileSync(filePath, JSON.stringify({ version }), "utf8");
console.log("version generated:", version);
