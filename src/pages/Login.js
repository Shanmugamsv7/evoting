import { ethers } from "ethers";
import { useState } from "react";
import { ADMIN_ADDRESS } from "../config";

function Login({ setRole, setEnteredAddress }) {
  const [loginId, setLoginId] = useState("");
  const [message, setMessage] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      setMessage("MetaMask not installed");
      return null;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0];
  };

  const login = async (type) => {
    setMessage("");

    if (!loginId) {
      setMessage("Please enter Wallet ID");
      return;
    }

    const connected = await connectWallet();
    if (!connected) return;

    if (connected.toLowerCase() !== loginId.toLowerCase()) {
      setMessage("Entered ID and MetaMask wallet do not match");
      return;
    }

    if (type === "admin") {
      if (loginId.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
        setMessage("Not an Admin wallet");
        return;
      }
      setRole("admin");
    } else {
      setRole("user");
    }

    setEnteredAddress(loginId);
  };

  return (
  <div className="login-card">
    <h1>Secure E-Voting</h1>

    <input
      placeholder="Wallet Address"
      value={loginId}
      onChange={(e) => setLoginId(e.target.value)}
    />

    <button onClick={() => login("admin")}>
      Admin Login
    </button>

    <button onClick={() => login("user")}>
      User Login
    </button>

    {message && <p className="error">{message}</p>}
  </div>
);

}

export default Login;
