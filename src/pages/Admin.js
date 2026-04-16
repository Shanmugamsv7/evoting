import React, { useContext, useState } from "react";
import { ethers } from "ethers";
import { ElectionContext } from "../context/ElectionContext";
import { CONTRACT_ABI } from "../config";

function Admin({ onLogout }) {
  const {
    elections,
    setElections,
    activeElection,
    setActiveElectionId,
    voters,
    setVoters,
    contractAddress,
    setContractAddress
  } = useContext(ElectionContext);

  const [tab, setTab] = useState("elections");

  const [electionName, setElectionName] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [party, setParty] = useState("");

  const [voterWallet, setVoterWallet] = useState("");
  const [voterName, setVoterName] = useState("");
  const [search, setSearch] = useState("");

  /* ===================== ELECTION ===================== */

  function createElection() {
    if (!electionName) return;

    setElections([
      ...elections,
      {
        electionId: Date.now(),
        electionName,
        candidates: []
      }
    ]);

    setElectionName("");
  }

  function removeElection(id) {
    setElections(elections.filter(e => e.electionId !== id));
    if (activeElection && activeElection.electionId === id) {
      setActiveElectionId(null);
    }
  }

  function addCandidate() {
    if (!activeElection || !candidateName || !party) return;

    const updated = elections.map(e => {
      if (e.electionId === activeElection.electionId) {
        return {
          ...e,
          candidates: [
            ...e.candidates,
            { id: Date.now(), name: candidateName, party }
          ]
        };
      }
      return e;
    });

    setElections(updated);
    setCandidateName("");
    setParty("");
  }

  function removeCandidate(id) {
    const updated = elections.map(e => {
      if (e.electionId === activeElection.electionId) {
        return {
          ...e,
          candidates: e.candidates.filter(c => c.id !== id)
        };
      }
      return e;
    });
    setElections(updated);
  }

  /* ===================== VOTERS ===================== */

  async function addVoter() {
  if (!voterWallet || !voterName) return;

  const exists = voters.some(
    v => v.wallet.toLowerCase() === voterWallet.toLowerCase()
  );
  if (exists) {
    alert("Voter already exists");
    return;
  }

  let approved = false;

  // 🔑 CHECK BLOCKCHAIN STATUS WHEN ADDING
  if (contractAddress && window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        provider
      );
      const balance = await contract.balanceOf(voterWallet);
      approved = balance > 0n;
    } catch {
      approved = false;
    }
  }

  setVoters([
    ...voters,
    {
      wallet: voterWallet,
      name: voterName,
      approved
    }
  ]);

  setVoterWallet("");
  setVoterName("");
}
async function removeVoter(wallet) {
  try {
    if (!contractAddress) {
      alert("Enter contract address first");
      return;
    }

    if (!window.ethereum) {
      alert("MetaMask not found");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      CONTRACT_ABI,
      signer
    );

    // 🔥 Burn NFT on blockchain
    const tx = await contract.revokeVoter(wallet);
    await tx.wait();

    // 🔥 Remove from frontend list
    setVoters(prev =>
      prev.filter(v => v.wallet.toLowerCase() !== wallet.toLowerCase())
    );

    alert("Voter removed and NFT burned successfully");

  } catch (err) {
  console.error("REMOVE ERROR:", err);
  alert(err.reason || err.message);
}

}
  /* ===================== APPROVE VOTER (ASYNC) ===================== */

  async function approveVoter(wallet) {
    try {
      if (!contractAddress) {
        alert("Enter contract address first");
        return;
      }

      if (!window.ethereum) {
        alert("MetaMask not found");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        signer
      );

      const balance = await contract.balanceOf(wallet);

      if (balance > 0n) {
        // already approved on blockchain
        setVoters(prev =>
          prev.map(v =>
            v.wallet.toLowerCase() === wallet.toLowerCase()
              ? { ...v, approved: true }
              : v
          )
        );
        alert("Voter already approved");
        return;
      }

      const metadataCID = "ipfs://bafkreiefic4pcemgx3637zejtutn7kr4kmqyfhefj6ux7zhoavdurpft6i";
      const tx = await contract.issueVoteNFT(wallet, metadataCID);
      await tx.wait();

      setVoters(prev =>
        prev.map(v =>
          v.wallet.toLowerCase() === wallet.toLowerCase()
            ? { ...v, approved: true }
            : v
        )
      );

      alert("Voter approved successfully");
    } catch (err) {
      console.error(err);
      alert("Approval failed");
    }
  }
  

  /* ===================== SEARCH ===================== */

  const filteredVoters = voters.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.wallet.toLowerCase().includes(search.toLowerCase())
  );

  
  /* ===================== UI ===================== */

  return (
    <div className="card">
      <h2>Admin Dashboard</h2>

      <input
        placeholder="Smart Contract Address"
        value={contractAddress}
        onChange={e => setContractAddress(e.target.value)}
      />

      <div className="row">
        <button onClick={() => setTab("elections")}>Elections</button>
        <button onClick={() => setTab("voters")}>Voters</button>
      </div>

      {tab === "elections" && (
        <>
          <input
            placeholder="Election Name"
            value={electionName}
            onChange={e => setElectionName(e.target.value)}
          />
          <button onClick={createElection}>Create Election</button>

          {elections.map(e => (
            <div key={e.electionId} className="row">
              <span>{e.electionName}</span>
              <button onClick={() => setActiveElectionId(e.electionId)}>
                Select
              </button>
              <button className="danger" onClick={() => removeElection(e.electionId)}>
                Remove
              </button>
            </div>
          ))}

          {activeElection && (
            <>
              <h4>{activeElection.electionName}</h4>

              <input
                placeholder="Candidate Name"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
              />
              <input
                placeholder="Party"
                value={party}
                onChange={e => setParty(e.target.value)}
              />
              <button onClick={addCandidate}>Add Candidate</button>

              {activeElection.candidates.map(c => (
                <div key={c.id} className="row">
                  {c.name} ({c.party})
                  <button
                    className="danger"
                    onClick={() => removeCandidate(c.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {tab === "voters" && (
        <>
          <input
            placeholder="Search voter"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <input
            placeholder="Voter Wallet"
            value={voterWallet}
            onChange={e => setVoterWallet(e.target.value)}
          />
          <input
            placeholder="Voter Name"
            value={voterName}
            onChange={e => setVoterName(e.target.value)}
          />
          <button onClick={addVoter}>Add Voter</button>

          {filteredVoters.map(v => (
            <div key={v.wallet} className="row">
              <span>{v.name} – {v.wallet.slice(0, 6)}...</span>
              <span>{v.approved ? "✅ Approved" : "⏳ Pending"}</span>
              {!v.approved && (
                <button onClick={() => approveVoter(v.wallet)}>
                  Approve
                </button>
              )}
              <button className="danger" onClick={() => removeVoter(v.wallet)}>
                Remove
              </button>
            </div>
          ))}
        </>
      )}

      <button className="danger" onClick={onLogout}>Logout</button>
    </div>
  );
}

export default Admin;
