import { gsr } from "./gas.ts";
import "./App.css";
import { Button } from "./components/ui/button.tsx";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Hello />
    </QueryClientProvider>
  );
}

function Hello() {
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
    </div>
  );
}

export default App;
