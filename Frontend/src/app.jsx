import React from "react";
import { AuthProvider } from "./Controllers/authController";
import RouterComponent from "./routes";
import "./Assets/Styles/global.css";

function App() {
  return (
    <AuthProvider>
      <RouterComponent />
    </AuthProvider>
  );
}

export default App;