import { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import { ElectionContext } from "../context/ElectionContext";
import { CONTRACT_ABI } from "../config";

function User({ onLogout, userAddress }) {
  const { activeElection, contractAddress, voters } =
    useContext(ElectionContext);

  const [votes, setVotes] = useState({});
  const [error, setError] = useState("");

  /* ================= VERIFY USER ================= */

  useEffect(() => {
    checkAndAddNFT();
    if (!contractAddress || !activeElection) return;
    verifyUser();
    loadVotes();
    autoAddNFT();
    // eslint-disable-next-line
  }, [contractAddress, activeElection]);
  async function checkAndAddNFT() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);

  const balance = await contract.balanceOf(userAddress);

  if (balance > 0n) {
    const tokenId = await contract.tokenOfOwnerByIndex(userAddress, 0);

    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC721",
        options: {
          address: contractAddress,
          tokenId: tokenId.toString()
        }
      }
    });
  }
}
  const verifyUser = async () => {
    try {
      // 1️⃣ CHECK ADMIN VOTER LIST
      const voterExists = voters.some(
        v => v.wallet.toLowerCase() === userAddress.toLowerCase()
      );

      if (!voterExists) {
        alert("You are not registered by admin");
        onLogout();
        return;
      }

      // 2️⃣ CHECK BLOCKCHAIN NFT
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        provider
      );

      const balance = await contract.balanceOf(userAddress);
      if (balance === 0n) {
        alert("You are not approved by admin");
        onLogout();
      }
    } catch (err) {
      console.error(err);
      alert("Verification failed");
      onLogout();
    }
  };
const autoAddNFT = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      contractAddress,
      CONTRACT_ABI,
      provider
    );

    const balance = await contract.balanceOf(userAddress);

    if (balance > 0n) {
      const tokenId = await contract.tokenOfOwnerByIndex(userAddress, 0);

      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC721",
          options: {
            address: contractAddress,
            tokenId: tokenId.toString(),
          },
        },
      });
    }
  } catch (err) {
    console.error("Auto add NFT failed:", err);
  }
};

  /* ================= LOAD VOTES ================= */

  const loadVotes = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        provider
      );

      let temp = {};
      for (let c of activeElection.candidates) {
        temp[c.id] = Number(
            await contract.getCandidateVotes(activeElection.electionId, c.id)
        );

      }
      setVotes(temp);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= CAST VOTE ================= */

  const vote = async (candidateId) => {
    try {
      setError("");
      if (!activeElection) {
        setError("No active election");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        signer
      );

      const balance = await contract.balanceOf(userAddress);
        if (balance === 0n) {
          setError("You are not approved to vote");
          return;
        }

const tokenId = await contract.tokenOfOwnerByIndex(userAddress, 0);

      const tx = await contract.castVote(
          activeElection.electionId,
          tokenId,
          candidateId
      );

      await tx.wait();

      await loadVotes();
    } catch (err) {
      console.error(err);
      setError("Voting failed. Check approval or election status.");
    }
  };

  /* ================= UI ================= */

  if (!activeElection || !activeElection.candidates) {
    return (
      <div className="vote-card">
        <h2>No Active Election</h2>
        <button className="danger" onClick={onLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="vote-card">
      <h2>{activeElection.electionName}</h2>

      {activeElection.candidates.length === 0 && (
        <p>No candidates added yet</p>
      )}

      {activeElection.candidates.map(c => (
        <div key={c.id} className="row">
          <button onClick={() => vote(c.id)}>
            {c.name} ({c.party})
          </button>
          <span>🗳 {votes[c.id] ?? 0}</span>
        </div>
      ))}

      {error && <p className="error">{error}</p>}

      <button className="danger" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default User;
