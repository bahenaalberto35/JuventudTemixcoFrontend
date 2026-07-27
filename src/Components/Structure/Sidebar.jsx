import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import Beneficiarios from "../../assets/Beneficiarios.svg";
import Afiliados from "../../assets/Afiliados.svg";
import Administracion from "../../assets/Administracion.svg";
import Programas from "../../assets/Programas.svg";
import Secciones from "../../assets/Secciones.svg";
import Alianzas from "../../assets/Alianzas.svg";
import Objetivos from "../../assets/Objetivos.svg";
import Logout from "../../assets/Logout.svg";
import {alertaCerrarSesion, alertaError, alertaExito, confirmarEliminar} from "../../Utils/alerts.js";
import {eliminarDatos} from "../../Utils/api.js";

const navItems = [
    {label: "Beneficiarios", icon: Beneficiarios, path: "/admin/beneficiarios"},
    {label: "Voluntariado", icon: Afiliados, path: "/admin/afiliados"},
    {label: "Administración", icon: Administracion, path: "/admin/administracion"},
    {label: "Programas", icon: Programas, path: "/admin/programas"},
    {label: "Secciones", icon: Secciones, path: "/admin/secciones"},
    {label: "Alianzas", icon: Alianzas, path: "/admin/alianzas"},
    {label: "Objetivos", icon: Objetivos, path: "/admin/objetivos"},
];

export default function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();



    const handleLogout = async () => {
        const resultado = await alertaCerrarSesion();
        
        if (resultado.isConfirmed) {
            setMobileOpen(false);
            localStorage.clear();
            navigate("/", { replace: true });
        }
    };

    return (
        <>
            {/* Mobile hamburger */}
            <button
                className="sidebar-hamburger"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Abrir menú"
            >
                <span /><span /><span />
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`sidebar${mobileOpen ? " sidebar--open" : ""}`}>
                <nav className="sidebar__nav">
                    {navItems.map(({ label, icon, path }) => (
                        <NavLink
                            key={label}
                            to={path}
                            className={({ isActive }) =>
                                `sidebar__item${isActive ? " sidebar__item--active" : ""}`
                            }
                            onClick={() => 
                                setMobileOpen(false)}
                        >
              <span className="sidebar__icon">
                <img
                    src={icon}
                    alt={label}
                    width="28"
                    height="28"
                />
              </span>
                            <span className="sidebar__label">{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar__divider" />

                <button className="sidebar__item sidebar__item--logout" onClick={handleLogout}>
          <span className="sidebar__icon">
            <img
                src={Logout}
                alt="Cerrar Sesión"
                width="28"
                height="28"
            />
          </span>
                    <span className="sidebar__label">Cerrar Sesión</span>
                </button>
            </aside>
        </>
    );
}