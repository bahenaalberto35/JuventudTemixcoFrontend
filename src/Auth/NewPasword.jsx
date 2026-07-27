import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../Img/logo.png";
import { alertaExito, alertaError } from "../Utils/alerts.js";
import "./Login.css";
import "./NewPassword.css";

/* Reglas de seguridad */
const RULES = [
    { id: "length",  label: "Mínimo 8 caracteres",          test: (v) => v.length >= 8 },
    { id: "upper",   label: "Al menos una mayúscula",        test: (v) => /[A-Z]/.test(v) },
    { id: "lower",   label: "Al menos una minúscula",        test: (v) => /[a-z]/.test(v) },
    { id: "number",  label: "Al menos un número",            test: (v) => /\d/.test(v) },
    { id: "symbol",  label: "Al menos un símbolo (!@#$…)",   test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function strengthLabel(passed) {
    if (passed <= 1) return { text: "Muy débil",  color: "#e24b4a" };
    if (passed === 2) return { text: "Débil",      color: "#ef9f27" };
    if (passed === 3) return { text: "Regular",    color: "#ba7517" };
    if (passed === 4) return { text: "Buena",      color: "#639922" };
    return             { text: "Fuerte",           color: "#0f6e56" };
}

function PasswordField({ id, label, placeholder, value, onChange, error }) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="lf-field">
            <label className="lf-label" htmlFor={id}>{label}</label>
            <div className="lf-input-wrap">
                <input
                    id={id}
                    className={`lf-input${error ? " lf-input--error" : ""}`}
                    type={visible ? "text" : "password"}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    autoComplete="new-password"
                />
                <button
                    type="button"
                    className="lf-eye"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                    {visible ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    )}
                </button>
            </div>
            {error && <p className="np-field-error">{error}</p>}
        </div>
    );
}

function NewPassword() {
    const [password, setPassword]   = useState("");
    const [confirm, setConfirm]     = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading]     = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { correo, codigo } = location.state ?? {};

    /* Evaluación en tiempo real */
    const results  = RULES.map((r) => ({ ...r, passed: r.test(password) }));
    const passed   = results.filter((r) => r.passed).length;
    const allPass  = passed === RULES.length;
    const strength = password.length > 0 ? strengthLabel(passed) : null;

    const passwordError = submitted && !allPass
        ? "La contraseña no cumple todos los requisitos."
        : null;
    const confirmError = submitted && confirm && password !== confirm
        ? "Las contraseñas no coinciden."
        : submitted && !confirm
            ? "Por favor confirma tu contraseña."
            : null;

    const handleGuardar = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        if (!allPass || password !== confirm) return;

        setLoading(true);
        try {
            const response = await fetch("https://api.juventudxtemixco.org/api/auth/actualizarPassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, codigo, contrasena: password }),
            });

            if (response.ok) {
                alertaExito("Contraseña actualizada correctamente.");
                navigate("/", { replace: true });
            } else {
                const data = await response.json();
                alertaError(data.mensaje ?? "No se pudo actualizar la contraseña.");
                alert(data.mensaje ?? "No se pudo actualizar la contraseña.");
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
                <div className="lf-logo-wrap">
                    <div className="lf-logo-placeholder" aria-label="Juventud x Temixco">
                        <img src={logo} className="lf-logo" alt="Juventud x Temixco" />
                    </div>
                </div>

                <h1 className="lf-title">Cambiar contraseña</h1>

                <p className="lf-description">
                    Introduce una nueva contraseña para iniciar sesión en tu cuenta
                </p>

                <form onSubmit={handleGuardar} noValidate>
                    <PasswordField
                        id="np-password"
                        label="Nueva contraseña:"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={passwordError}
                    />

                    {password.length > 0 && (
                        <div className="np-strength">
                            <div className="np-strength-bar">
                                {RULES.map((_, i) => (
                                    <div
                                        key={i}
                                        className="np-strength-seg"
                                        style={{ background: i < passed ? strength.color : "#e0e0e0" }}
                                    />
                                ))}
                            </div>
                            <span className="np-strength-label" style={{ color: strength.color }}>
                                {strength.text}
                            </span>

                            <ul className="np-rules">
                                {results.map((r) => (
                                    <li key={r.id} className={`np-rule ${r.passed ? "np-rule--ok" : "np-rule--fail"}`}>
                                        <span className="np-rule-icon">{r.passed ? "✓" : "✗"}</span>
                                        {r.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <PasswordField
                        id="np-confirm"
                        label="Confirma la contraseña:"
                        placeholder="Contraseña"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        error={confirmError}
                    />

                    <div className="lf-actions" style={{ marginTop: "1.25rem" }}>
                        <button
                            type="button"
                            className="lf-btn lf-btn--secondary"
                            onClick={() => navigate(-1)}
                        >
                            Regresar
                        </button>
                        <button
                            type="submit"
                            className="lf-btn lf-btn--primary"
                            disabled={loading}
                        >
                            {loading ? "Guardando…" : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewPassword;