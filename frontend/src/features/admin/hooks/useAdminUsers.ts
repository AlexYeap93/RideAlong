import { useEffect, useState } from "react";
import { usersAPI } from "../../../services/api";

export function useAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getUsers();
      setUsers(res.data);
    } 
    catch (err) {
      console.error("Failed to fetch users:", err);
    } 
    finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return { users, loading, refresh: fetchUsers,};
}
