import { useEffect, useState } from "react";
import { issuesAPI } from "../../../services/IssueServices";

export function useAdminIssues() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await issuesAPI.getIssues();
      setIssues(res.data);
    } 
    catch (err) {
      console.error("Failed to fetch issues:", err);
    } 
    finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssues();}, []);

  return { issues, loading, refresh: fetchIssues,};
}
