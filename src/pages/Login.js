import { useState } from "react";
import { ethers } from "ethers";

function Login({ goAdmin, goUser }) {
  const [inputAddress, setInputAddress] = useState("");

  async function connectAndValidate(isAdmin) {
    try {
      if (!window.ethereum) {
        alert("MetaMask not found");
        return;
      }

      if (!inputAddress) {
        alert("Enter wallet address");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      // 🔥 Ask MetaMask for account
      const accounts = await provider.send("eth_requestAccounts", []);
      const metamaskAddress = accounts[0];

      // 🔥 Compare addresses
      if (
        metamaskAddress.toLowerCase() !== inputAddress.toLowerCase()
      ) {
        alert("Entered address & MetaMask wallet do not match");
        return;
      }

      // ✅ SUCCESS
      if (isAdmin) {
        goAdmin();
      } else {
        goUser(metamaskAddress);
      }

    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  }

  return (
    <div className="login-card">
      <h2>Secure E-Voting</h2>

      <input
        placeholder="Wallet Address"
        value={inputAddress}
        onChange={(e) => setInputAddress(e.target.value)}
      />

      <button onClick={() => connectAndValidate(true)}>
        Admin Login
      </button>

      <button onClick={() => connectAndValidate(false)}>
        User Login
      </button>
    </div>
  );
}

export default Login;