import { useEffect, useState } from "react";
import { driversAPI } from "../../../services/api";

export function useAdminDrivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await driversAPI.getDrivers();
      setDrivers(res.data);
      setPendingDrivers(res.data.filter((d: any) => !d.is_approved));
    } 
    catch (err) {
      console.error("Failed to fetch drivers:", err);
    } 
    finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  return {drivers, pendingDrivers, loading, refresh: fetchDrivers,};
}
