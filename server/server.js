const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const connectdb = require("./config/db.js");
const route = require("./routes/invoiceRoute.js");
const proroute = require("./routes/productRoute.js");

// ✅ Direct MongoDB URL (move to .env in production!)
const mongoUrl = "mongodb+srv://pagalavanks22cse:djbdqVHcJjc1fArv@cluster0.fczosvo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['*']
}));

app.use(express.json());

app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

app.use('/api', route);
app.use('/api/products', proroute);

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle API requests
app.get('/api/status', (req, res) => {
  res.json({ status: "API is running" });
});

// For any other request, send the React app's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await connectdb(mongoUrl);
});
