import { gsr } from "./gas.ts";
import "./App.css";
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
  const serverQuery = useQuery({
    queryKey: ["getSheetNames"],
    queryFn: () => gsr<string[]>("getSheetNames"),
  });

  const isSuccess = serverQuery.isSuccess && !serverQuery.isError;
  const isError = serverQuery.isError;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        {isSuccess && (
          <>
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-500 font-medium">Successfully connected to server</span>
          </>
        )}
        {isError && (
          <>
            <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-destructive font-medium">Failed to connect to server</span>
          </>
        )}
        {serverQuery.isLoading && (
          <span className="text-muted-foreground">Connecting to server...</span>
        )}
      </div>
      {isSuccess && serverQuery.data && (
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {serverQuery.data.map((sheet) => (
            <span key={sheet} className="px-3 py-1 bg-muted rounded-full text-sm">
              {sheet}
            </span>
          ))}
        </div>
      )}
      {isError && (
        <p className="text-sm text-destructive">{serverQuery.error.message}</p>
      )}
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
