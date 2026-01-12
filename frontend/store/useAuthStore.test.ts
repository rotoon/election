import { act } from "@testing-library/react";
import { useAuthStore } from "./useAuthStore";

// Mock persist middleware to avoid storage issues in test environment
// But since we are testing logic, simple mocking or testing public API is fine.
// zustand-persist usually works with jsdom localstorage.

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset store before each test
    const { logout } = useAuthStore.getState();
    act(() => {
      logout();
    });
  });

  it("should have initial state as unauthenticated", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should login correctly", () => {
    const mockUser = {
      id: "123",
      national_id: "1111111111111",
      full_name: "Test User",
      address: "Bangkok",
      role: "voter" as const,
      constituency_id: 1,
      created_at: "2023-01-01",
      email: "test@example.com",
    };

    act(() => {
      useAuthStore.getState().login(mockUser, "mock-token");
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("should logout correctly", () => {
    // Setup login state
    const mockUser = {
      id: "123",
      national_id: "1111111111111",
      full_name: "Test User",
      address: "Bangkok",
      role: "voter" as const,
      constituency_id: 1,
      created_at: "2023-01-01",
      email: "test@example.com",
    };
    act(() => {
      useAuthStore.getState().login(mockUser, "mock-token");
    });

    // Perform logout
    act(() => {
      useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
