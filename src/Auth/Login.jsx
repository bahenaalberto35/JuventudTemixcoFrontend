import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
// import { AuthContext } from "./AuthContext.jsx";
import { alertaCamposVacios, alertaError, alertaExito } from "../Utils/alerts.js";
import logo from "../Img/logo.png";
import "./Login.css";

function InputField({ label, type = "text", placeholder, value, onChange }) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (visible ? "text" : "password") : type;

    const navigate = useNavigate();

    return (
        <div className="lf-field">
            <label className="lf-label">{label}</label>
            <div className="lf-input-wrap">
                <input
                    className="lf-input"
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    autoComplete={isPassword ? "current-password" : "email"}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="lf-eye"
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {visible ? (
                            /* ojo tachado */
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                        ) : (
                            /* ojo abierto */
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

function Login() {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleForgotPassword = () => {
        navigate("/forgotPassword");
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!correo || !password) {
            alertaCamposVacios("Por favor completa todos los campos.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("https://api.juventudxtemixco.org/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, password }),
            });

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem("token", data.accessToken);
                localStorage.setItem("usuario", JSON.stringify(data));

                const rol = (data.rol ?? "").toUpperCase();

                if (rol === "ADMIN" || rol === "ROLE_ADMIN") {
                    // login(data.correo, "admin", data.token);
                    // navigate("/dashboard");
                    alertaExito("Inicio de sesión exitoso");
                    navigate("/admin/beneficiarios");
                } else {
                    alert("No tienes permisos de administrador.");
                }
            } else {
                alertaError("Credenciales inválidas");
            }
        } catch (err) {
            console.error(err);
            alertaError("No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lf-page">
            <div className="lf-card">
                {/* Logo */}
                <div className="lf-logo-wrap">
                    <div className="lf-logo-placeholder" aria-label="Juventud x Temixco">
                        <img src={logo} className="lf-logo" alt="Juventud x Temixco" />
                    </div>
                </div>

                {/* Título */}
                <h1 className="lf-title">Iniciar Sesión</h1>

                {/* Aviso */}
                <div className="lf-notice">
                    <span className="lf-notice-label">¡Aviso!</span>
                    <p className="lf-notice-text">Solo administradores pueden iniciar sesión</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleLogin} noValidate>
                    <InputField
                        label="Correo:"
                        type="email"
                        placeholder="Correo electrónico"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                    />

                    <InputField
                        label="Contraseña:"
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="button"
                        className="lf-forgot"
                        onClick={handleForgotPassword}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>

                    <div className="lf-actions">
                        <button
                            type="button"
                            className="lf-btn lf-btn--secondary"
                            onClick={() => navigate("/")}
                        >
                            Regresar
                        </button>
                        <button
                            type="submit"
                            className="lf-btn lf-btn--primary"
                            disabled={loading}
                        >
                            {loading ? "Entrando…" : "Iniciar sesión"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;