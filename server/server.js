const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const connectdb = require("./config/db.js");
const route = require("./routes/invoiceRoute.js");
const proroute = require("./routes/productRoute.js");

// ✅ Direct MongoDB URL (move to .env in production!)
const mongoUrl = "mongodb+srv://pagalavanks22cse:djbdqVHcJjc1fArv@cluster0.fczosvo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const port = 5000;

app.use(cors());
app.use(express.json());
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

app.use('/api', route);
app.use('/api/products', proroute);

app.get('/', (req, res) => {
  res.json("Welcome to Server");
});

app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  await connectdb(mongoUrl); // ✅ This will now work
});
