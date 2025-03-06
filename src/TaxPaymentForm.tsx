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
      await fetch("http://localhost:5000/save-tax-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationalID, date }),
      });
    } catch (error) {
      console.error("Error saving data:", error);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nationalID || !form.taxNumber || !form.amountPaid || !form.yearlyIncome) {
      alert("All fields are required.");
      return;
    }
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
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Tax Payment Submission</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <ul className="space-y-3">
          <li>
            <label className="block font-medium">National ID:</label>
            <input type="text" name="nationalID" value={form.nationalID} onChange={handleChange} className="w-full p-2 border rounded" required />
          </li>
          <li>
            <label className="block font-medium">Tax Number:</label>
            <input type="text" name="taxNumber" value={form.taxNumber} onChange={handleChange} className="w-full p-2 border rounded" required />
          </li>
          <li className="w-full p-2 border rounded bg-gray-100">
            <label className="block font-medium">Amount Paid:</label>
            {form.amountPaid || "N/A"}
          </li>
          <li>
            <label className="block font-medium">Yearly Income:</label>
            <input type="number" name="yearlyIncome" value={form.yearlyIncome} onChange={handleChange} className="w-full p-2 border rounded" required />
          </li>
        </ul>
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded" disabled={payDisabled}>Pay</button>
      </form>
    </div>
  );
}
