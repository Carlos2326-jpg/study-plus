import React from "react";
import { AuthProvider } from "./Controllers/authController";
import RouterComponent from "./routes";

function App() {
  return (
    <AuthProvider>
      <RouterComponent />
    </AuthProvider>
  );
}

export default App;