import { Outlet } from "react-router-dom";
import Layout from "../components/Layout";

const NAV = [
  { to: "/member", label: "Dashboard", end: true },
  { to: "/member/payments", label: "Payments" },
  { to: "/member/sessions", label: "Sessions" },
];

export default function MemberPortal() {
  return (
    <Layout nav={NAV}>
      <Outlet />
    </Layout>
  );
}
