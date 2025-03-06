import { useState } from "react";
import "./style.css";
import { useEffect, useState } from "react";
import abi from "../config/abi.json";
import { ethers, encodeBytes32String } from "ethers";



export default function TaxPaymentForm() {
  const contractadd = "0xB3551e4f487052c1C30a0A47420C6578Cdbb5B3D";
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  useEffect(() => {
    async function initialize() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(contractadd, abi, signer);
        setAddress(address);
        setContract(contract);
      }
    }
    initialize();
  });

  const [form, setForm] = useState({
    nationalID: "",
    transactionNumber: "",
    taxNumber: "",
    amountPaid: "",
    yearlyIncome: ""
  });
  const [payDisabled, setPayDisabled] = useState(false);

  const generateTransactionNumber = (amountPaid: string, yearlyIncome: string) => {
    const randomFourDigit = Math.floor(1000 + Math.random() * 9000);
    return (parseInt(amountPaid) + parseInt(yearlyIncome) + randomFourDigit).toString();
  };

  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  const saveToFile = async (nationalID: string) => {
    const date = getCurrentDate();
  
    try {
      const response = await fetch("http://localhost:5000/save-tax-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationalID, date }),
      });

      const data = await response.json();

      if (response.status === 400) {
        alert(`Error: ${data.message}`); // 🚨 Notify if already paid
        setPayDisabled(false);
        return false;
      } else if (response.status === 200) {
        return true;
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("An error occurred while processing your request.");
      setPayDisabled(false);
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === "yearlyIncome") {
      const income = parseFloat(value);
      if (income >= 12000 && income <= 24000) {
        updatedForm.amountPaid = "300";
      } else if (income >= 24001 && income <= 36000) {
        updatedForm.amountPaid = "600";
      } else {
        updatedForm.amountPaid = "";
      }
    }
    setForm(updatedForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nationalID || !form.taxNumber || !form.amountPaid || !form.yearlyIncome) {
      alert("All fields are required.");
      return;
    }

    setPayDisabled(true);

    const canProceed = await saveToFile(form.nationalID);
    if (!canProceed) return;

    const transactionNumber = generateTransactionNumber(form.amountPaid, form.yearlyIncome);
    setForm({ ...form, transactionNumber });
    setPayDisabled(true);

    async function addTaxDetails() {
      console.log("FUCK");
      const log = await contract?.addTaxDetails(form.nationalID, form.taxNumber, form.transactionNumber, form.amountPaid, form.yearlyIncome);
      console.log(log);
      getTaxDetails();
    }

    async function getTaxDetails() {
      const log = await contract?.taxDetails(encodeBytes32String(form.nationalID));
      console.log(log);
    }

    setTimeout(() => {
      alert(`Transaction Successful\nTransaction Number: ${transactionNumber}`);
      saveToFile(form.nationalID);
      addTaxDetails();

      setPayDisabled(false);
    }, 100);
  };

  return (
    <div className="container">
    <h2 className="title">Tax Payment Submission</h2>
    <form onSubmit={handleSubmit} className="form">
      <ul className="form-list">
        <li>
          <label className="label">National ID:</label>
          <input type="text" name="nationalID" value={form.nationalID} onChange={handleChange} className="input" required />
        </li>
        <li>
          <label className="label">Tax Number:</label>
          <input type="text" name="taxNumber" value={form.taxNumber} onChange={handleChange} className="input" required />
        </li>
        <li className="amount-box">
          <label className="amount-label">Amount Paid:</label>
          {form.amountPaid || "N/A"}
        </li>
        <li>
          <label className="label">Yearly Income:</label>
          <input type="number" name="yearlyIncome" value={form.yearlyIncome} onChange={handleChange} className="input" required />
        </li>
      </ul>
      <div >
      <button type="submit" className="submit-btn" disabled={payDisabled}>
        Pay
      </button>
      </div>
    </form>
  </div>
  );
}
