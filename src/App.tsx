import { useState } from "react";
import { gsr } from "./gas.ts";
import "./App.css";
import { Button } from "./components/ui/button.tsx";

function App() {
  const [serverMessage, setServerMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const callHelloWorld = async () => {
    setLoading(true);
    setServerMessage("");
    try {
      const result = await gsr<string>("helloWorld");
      setServerMessage(result);
    } catch {
      setServerMessage("GAS runtime not available (dev mode)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button onClick={callHelloWorld} disabled={loading}>
        Click me
      </Button>
      <p>{loading ? "Loading" : serverMessage}</p>
    </div>
  );
}

export default App;
