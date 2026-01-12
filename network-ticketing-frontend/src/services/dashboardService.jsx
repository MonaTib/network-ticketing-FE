import api from "../utils/axios";

export const getDashboardSummary = async () => {
  const res = await api.get("/api/dashboard/summary");
  return res.data;
};
export default function Dashboard() {
  return (
    <div>
      <p>Welcome to Network Ticketing System</p>
    </div>
  );
}
