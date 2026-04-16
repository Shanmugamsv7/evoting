import { useState } from "react";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import User from "./pages/User";

function App() {
  const [page, setPage] = useState("login");
  const [userAddress, setUserAddress] = useState("");

  return (
    <>
      {page === "login" && (
        <Login
          goAdmin={() => setPage("admin")}
          goUser={(addr) => {
            setUserAddress(addr);
            setPage("user");
          }}
        />
      )}

      {page === "admin" && (
        <Admin onLogout={() => setPage("login")} />
      )}

      {page === "user" && (
        <User
          userAddress={userAddress}
          onLogout={() => setPage("login")}
        />
      )}
    </>
  );
}

export default App;