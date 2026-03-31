import { verifyAdmin } from "@/database/shopService";
import { AdminUser } from "@/types/models";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type AdminAuthContextType = {
  adminUser: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const user = await verifyAdmin(username, password);
    setAdminUser(user);
    return Boolean(user);
  }, []);

  const logout = useCallback(() => {
    setAdminUser(null);
  }, []);

  const value = useMemo(
    () => ({ adminUser, login, logout }),
    [adminUser, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }
  return context;
}
