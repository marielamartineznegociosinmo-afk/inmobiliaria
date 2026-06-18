import { createRoot } from "react-dom/client";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

setBaseUrl(import.meta.env.VITE_API_URL ?? "http://localhost:8080");

// Attach bearer token from localStorage (admin_token) to API requests made
// through the generated client / customFetch. This ensures authenticated
// admin actions (upload, create/update/delete properties) include the
// Authorization header and don't receive 401 responses from the server.
setAuthTokenGetter(() => {
	try {
		return localStorage.getItem("admin_token");
	} catch {
		return null;
	}
});

createRoot(document.getElementById("root")!).render(<App />);
