import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Helper component to read context
function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="user">{JSON.stringify(auth.user)}</span>
      <span data-testid="loading">{String(auth.loading)}</span>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

describe("AuthContext — no token", () => {
  it("sets user to null and loading to false when no token", async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("user").textContent).toBe("null");
  });
});

describe("AuthContext — demo token", () => {
  it("loads demo user when token is demo_token", async () => {
    localStorage.setItem("traveloops_token", "demo_token");
    renderWithAuth();
    await waitFor(() => {
      const user = JSON.parse(screen.getByTestId("user").textContent);
      expect(user.name).toBe("Traveler");
      expect(user.email).toBe("traveler@traveloops.app");
    });
  });
});

describe("AuthContext — expired JWT", () => {
  function makeExpiredToken() {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const expiredPayload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 }));
    return `${header}.${expiredPayload}.fakesig`;
  }

  it("logs out immediately when token is expired", async () => {
    localStorage.setItem("traveloops_token", makeExpiredToken());
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(localStorage.getItem("traveloops_token")).toBeNull();
  });
});

describe("AuthContext — malformed token", () => {
  it("treats malformed token as expired", async () => {
    localStorage.setItem("traveloops_token", "not-a-valid-token");
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("user").textContent).toBe("null");
  });
});
