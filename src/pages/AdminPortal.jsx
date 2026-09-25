import { Outlet } from "react-router-dom";
import Layout from "../components/Layout";

const NAV = [
  { to: "/admin", label: "Members", end: true },
  { to: "/admin/posters", label: "Posters & Events" },
  { to: "/admin/sync", label: "Sheets Sync" },
];

export default function AdminPortal() {
  return (
    <Layout nav={NAV}>
      <Outlet />
    </Layout>
  );
}
