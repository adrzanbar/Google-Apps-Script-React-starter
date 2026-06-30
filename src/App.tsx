import { gsr } from "./gas.ts";
import "./App.css";
import { Button } from "./components/ui/button.tsx";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { MemoryRouter, Link, Route, Routes } from "react-router";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function Home() {
  const query = useQuery({
    queryKey: ["hello"],
    queryFn: () => gsr<string>("hello"),
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <Button onClick={() => query.refetch()} disabled={query.isLoading}>
        Hello
      </Button>
      {query.isLoading && <p>Loading...</p>}
      {query.isError && (
        <p className="text-destructive">{query.error.message}</p>
      )}
      {query.isSuccess && <p>{query.data}</p>}
      <Link to="/about" className="text-sm underline">
        About
      </Link>
    </div>
  );
}

function About() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-bold">About</h1>
      <p>Routing works in GAS via MemoryRouter.</p>
      <Link to="/" className="text-sm underline">
        Home
      </Link>
    </div>
  );
}

export default App;
