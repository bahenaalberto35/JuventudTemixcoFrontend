import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {InputPassword} from "../Components/Inputs/InputPassword.jsx";
import logo from "../Img/logo.png";
import "./Login.css";
import {alertaError, alertaExito} from "../Utils/alerts.js";

const CODE_LENGTH = 5;

function VerifyCode() {
    const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
    const [loading, setLoading] = useState(false);
    const refs = useRef([]);

    const navigate = useNavigate();
    const location = useLocation();
    const correo = location.state?.correo ?? "";

    const handleChange = (index, e) => {
        const val = e.target.value;

        const digit = val.replace(/\D/g, "").slice(-1);

        const newDigits = [...digits];
        newDigits[index] = digit;
        setDigits(newDigits);

        if (digit && index < CODE_LENGTH - 1) {
            refs.current[index + 1]?.focus();
        }

        if (digit && index === CODE_LENGTH - 1) {
            const code = [...newDigits.slice(0, CODE_LENGTH - 1), digit].join("");
            if (code.length === CODE_LENGTH) {
                handleVerify(code);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        // Retroceder si el campo ya está vacío
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (code) => {
        setLoading(true);
        try {
            const response = await fetch("https://api.juventudxtemixco.org/api/auth/validarCodigo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, codigo: code }),
            });

            if (response.ok) {
                navigate("/newPassword", { state: { correo, codigo: code } });
            } else {
                const data = await response.json();
                alertaError(data.mensaje ?? "Código incorrecto. Intenta de nuevo.");
                setDigits(Array(CODE_LENGTH).fill(""));
                refs.current[0]?.focus();
            }
        } catch (err) {
            console.error(err);
            alertaError("No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleReenviar = async () => {
        if (!correo) return;
        try {
            await fetch("http://localhost:8080/api/usuarios/recuperar-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo }),
            });
            alertaExito("Código reenviado. Revisa tu correo.");
        } catch (err) {
            alertaError("No se pudo reenviar el código.");
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

                <h1 className="lf-title">Cambiar contraseña</h1>

                <p className="lf-description">
                    Hemos enviado un código de verificación al correo proporcionado
                </p>

                {/* Inputs del código */}
                <div className="vc-inputs">
                    {digits.map((digit, i) => (
                        <InputPassword
                            key={i}
                            value={digit}
                            onChange={(e) => handleChange(i, e)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            inputRef={(el) => (refs.current[i] = el)}
                            disabled={loading}
                        />
                    ))}
                </div>

                <p className="vc-hint">
                    Si no recibiste un código revisa la bandeja de spam o solicita el reenvío
                </p>

                {/* Acciones */}
                <div className="lf-actions">
                    <button
                        type="button"
                        className="lf-btn lf-btn--secondary"
                        onClick={() => navigate(-1)}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="lf-btn lf-btn--primary"
                        onClick={handleReenviar}
                        disabled={loading}
                    >
                        Reenviar código
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerifyCode;