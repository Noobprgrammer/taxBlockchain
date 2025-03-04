const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/save-tax-record", (req, res) => {
    const { nationalID, date } = req.body;
    if (!nationalID || !date) {
        return res.status(400).json({ message: "Invalid data" });
    }

    const record = `${nationalID} ${date}\n`;

    fs.appendFile("tax_records.txt", record, (err) => {
        if (err) {
            return res.status(500).json({ message: "Error saving data" });
        }
        res.status(200).json({ message: "Record saved successfully" });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
