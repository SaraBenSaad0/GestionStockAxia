import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function DashboardLayout() {
  return (
    <div className="app">

      <Sidebar />

      <div className="main-area">

        <Header />

        <main className="content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;