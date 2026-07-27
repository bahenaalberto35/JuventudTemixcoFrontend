import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { alertaError, alertaExito, alertaCamposVacios } from "../Utils/alerts.js";
import logo from "../Img/logo.png";
import "./Login.css";

function ForgotPassword() {
    const [correo, setCorreo] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleEnviarCodigo = async (e) => {
        e.preventDefault();

        if (!correo) {
            alertaCamposVacios("Por favor ingresa tu correo electrónico.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("https://api.juventudxtemixco.org/api/auth/recuperar-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo : correo}),
            });

            if (response.ok) {
                alertaExito("Código enviado. Revisa tu correo.");
                navigate("/verify", { state: { correo } });
            } else {
                const data = await response.json();
                alertaError(data.mensaje ?? "No se pudo enviar el código.");
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
                        <img src={logo} className="lf-logo" alt="Juventud x Temixco"/>
                    </div>
                </div>

                {/* Título */}
                <h1 className="lf-title">Cambiar contraseña</h1>

                {/* Descripción */}
                <p className="lf-description">
                    Enviaremos un código de verificación al correo electrónico que ingreses a continuación
                </p>

                {/* Formulario */}
                <form onSubmit={handleEnviarCodigo} noValidate>
                    <div className="lf-field">
                        <label className="lf-label" htmlFor="fp-correo">Correo:</label>
                        <input
                            id="fp-correo"
                            className="lf-input"
                            type="email"
                            placeholder="Correo electrónico"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            autoComplete="email"
                        />
                    </div>

                    <div className="lf-actions">
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
                            {loading ? "Enviando…" : "Enviar código"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;