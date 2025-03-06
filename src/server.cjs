const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5000;
const TAX_RECORDS_FILE = "tax_records.txt";

app.use(cors());
app.use(express.json());

// Function to check if NID exists in current year
const hasPaidThisYear = (nationalID, currentYear) => {
    if (!fs.existsSync(TAX_RECORDS_FILE)) {
        return false; // File doesn't exist yet, so no records exist
    }

    const records = fs.readFileSync(TAX_RECORDS_FILE, "utf8").split("\n");
    return records.some(record => {
        const [savedNID, savedDate] = record.split(" ");
        return savedNID === nationalID && savedDate.endsWith(currentYear);
    });
};

app.post("/save-tax-record", (req, res) => {
    const { nationalID, date } = req.body;
    if (!nationalID || !date) {
        return res.status(400).json({ message: "Invalid data" });
    }

    const currentYear = date.slice(-4); // Extract the last 4 digits (YYYY)

    // Check if NID already exists in this year
    if (hasPaidThisYear(nationalID, currentYear)) {
        return res.status(400).json({ message: "This NID has already paid tax for this year." });
    }

    // Append the new record
    const record = `${nationalID} ${date}\n`;
    fs.appendFile(TAX_RECORDS_FILE, record, (err) => {
        if (err) {
            return res.status(500).json({ message: "Error saving data" });
        }
        res.status(200).json({ message: "Record saved successfully" });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

