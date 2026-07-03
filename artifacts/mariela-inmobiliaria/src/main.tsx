import { createRoot } from "react-dom/client";
import { setBaseUrl, setAuthTokenGetter, setUnauthorizedHandler } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

setBaseUrl(import.meta.env.VITE_API_URL ?? "http://localhost:8080");

const appBaseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
function redirectToAdminLogin() {
  const loginPath = `${appBaseUrl}/admin/login`;
  window.location.replace(loginPath.startsWith("/") ? loginPath : `/${loginPath}`);
}

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

setUnauthorizedHandler(() => {
  try {
    localStorage.removeItem("admin_token");
  } catch {
    // Ignore localStorage errors.
  }

  redirectToAdminLogin();
});

createRoot(document.getElementById("root")!).render(<App />);
