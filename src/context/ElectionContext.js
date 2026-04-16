import { createContext, useState, useEffect } from "react";

export const ElectionContext = createContext();

export function ElectionProvider({ children }) {
  const [elections, setElections] = useState(() => {
    const e = localStorage.getItem("elections");
    return e ? JSON.parse(e) : [];
  });

  const [voters, setVoters] = useState(() => {
    const v = localStorage.getItem("voters");
    return v ? JSON.parse(v) : [];
  });

  // ✅ GLOBAL CONTRACT ADDRESS (IMPORTANT)
  const [contractAddress, setContractAddress] = useState(() => {
    return localStorage.getItem("contractAddress") || "";
  });

  const [activeElectionId, setActiveElectionId] = useState(() => {
    const id = localStorage.getItem("activeElectionId");
    return id ? Number(id) : null;
  });

  useEffect(() => {
    localStorage.setItem("elections", JSON.stringify(elections));
  }, [elections]);

  useEffect(() => {
    localStorage.setItem("voters", JSON.stringify(voters));
  }, [voters]);

  useEffect(() => {
    localStorage.setItem("contractAddress", contractAddress);
  }, [contractAddress]);

  useEffect(() => {
    if (activeElectionId !== null) {
      localStorage.setItem("activeElectionId", activeElectionId);
    }
  }, [activeElectionId]);

  const activeElection = elections.find(
    e => e.electionId === activeElectionId
  );

  return (
    <ElectionContext.Provider
      value={{
        elections,
        setElections,
        activeElection,
        setActiveElectionId,
        voters,
        setVoters,
        contractAddress,
        setContractAddress
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
}
