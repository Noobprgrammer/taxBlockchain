import "./style.css";
import { useEffect, useState } from "react";
import abi from "../config/abi.json";
import { ethers, encodeBytes32String } from "ethers";



export default function TaxPaymentForm() {
  const contractadd = "0xd01a07990bDbC2A0ad8149b3481950DD7C8Df9f3";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === "yearlyIncome") {
      const income = parseFloat(value);
      if (income >= 12000 && income <= 24000) {
        updatedForm.amountPaid = "300";
      } else if (income >= 24001 && income <= 36000) {
        updatedForm.amountPaid = "600";
      } else if (income > 36000) {
        updatedForm.amountPaid = "900";
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

    const canProceed = await isNewRecord(form.nationalID);
    if (!canProceed) {
      alert("The Specified NID Has Already Paid Their Taxes.");
      return;
    };

    const transactionNumber = generateTransactionNumber(form.amountPaid, form.yearlyIncome);
    setForm({ ...form, transactionNumber });
    setPayDisabled(true);

    async function addTaxDetails() {
      const log = await contract?.addTaxDetails(form.nationalID, form.taxNumber, form.transactionNumber, form.amountPaid, form.yearlyIncome);
      console.log(log);
    }

    async function getTaxDetails(nationalID: string) {
      const taxDetails = await contract?.taxDetails(encodeBytes32String(nationalID));
      console.log(taxDetails);
      return taxDetails;
    }

    async function isNewRecord(nationalID: string) {
      const taxDetails = await getTaxDetails(nationalID);

      return taxDetails[0] == encodeBytes32String("") || taxDetails[1] == encodeBytes32String("");
    }

    setTimeout(() => {
      alert(`Transaction Successful\nTransaction Number: ${transactionNumber}`);
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
