import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

function ProtectedRoutes({ allowedRoles }) {

    const token = localStorage.getItem("token");
    const usuarioRaw = localStorage.getItem("usuario");

    useEffect(() => {

    window.history.pushState(null, "", window.location.href);
    
    const bloqueo = (e) => {
        window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", bloqueo);
    
    return () => {
        window.removeEventListener("popstate", bloqueo);
    };
    }, [token, usuarioRaw]);
    
    
        if (!token || !usuarioRaw) {
        return <Navigate to="/login" replace />;
    }

    const usuario = JSON.parse(usuarioRaw);

    const userRol = (usuario.rol ?? "").toUpperCase();

    const hasAccess = allowedRoles.some(rol =>{
        const rolUpper = rol.toUpperCase();

        return rolUpper === userRol || userRol.includes(rolUpper);
    });

   
    if (!hasAccess) {
        return <Navigate to="/admin" replace />
    }

    return <Outlet/>
}

export default ProtectedRoutes;
