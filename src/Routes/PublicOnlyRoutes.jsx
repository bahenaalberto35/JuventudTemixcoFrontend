import { Navigate, Outlet } from "react-router-dom";

export default function PublicOnlyRoutes() {
    const token = localStorage.getItem("token");

    if (token) {
        return <Navigate to="/admin/beneficiarios" replace />;
    }

    return <Outlet />;
}