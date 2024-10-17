import { BrowserRouter as Router } from "react-router-dom";
import Routes from "./lib/Routes"
import { UserProvider } from "./context/UserContext";
import { PollProvider } from "./context/PollContext";
import { DarkModeContext } from "./context/DarkMode";
import { AdminProvider } from "./context/AdminContext";
import React,{useContext,useState,useEffect} from "react";

function App() {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <UserProvider>
    <PollProvider>
    <AdminProvider>
      <Router>
      <div className="">
      <Routes/>
      </div>
      
    </Router>
    </AdminProvider>
    </PollProvider>
    </UserProvider>
  );
}

export default App;
