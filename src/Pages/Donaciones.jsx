import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { alertaAgradecimiento, alertaError, alertaMasInformacion } from "../Utils/alerts";
import Input from "../Components/Inputs/Input.jsx";
import "./ModalGlobal.css";
import { enviarDatos } from "../Utils/api.js";
import {AmountButton} from "../Components/Buttons/AmountButton.jsx";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";


export default function Donaciones () {

    const [monto, setMonto] = useState(null);
    const [montoError, setMontoError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [procesandoPago, setProcesandoPago] = useState(false);

    const PAYPAL_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "ARxTw1vanVmlKpojDG26Zyd3t2yGBIyvx02ihKZ0y14jkKg41DSADFn2uVtoAvJNlSkjBIDGdMxK_r2l";

    const {
        register,
        handleSubmit,
        getValues,
        reset,
        formState: { errors, isValid },
    } = useForm({ mode: "onChange" });

    const onSubmit = async (data) => {
        if (!monto || monto <= 0) {
            setMontoError("Debes seleccionar un monto");
            return;
        }
    };

    return (
        <PayPalScriptProvider
            options={{
                "client-id": PAYPAL_ID,
                currency: "MXN"
            }}
        >
            <div className="donaciones-page">
                <div className="registro-card-view">
                    <div>
                        <h1 className="donaciones-title">Donar</h1>
                        <h2 className="donaciones-welcome">Tu aportación ayuda a financiar nuestros programas y actividades en beneficio de la comunidad.</h2>
                        <div style={{ textAlign: "center", marginTop: "15px" }}>
                            <button
                                type="button"
                                className="btn-cancelar"
                                style={{ width: "auto", padding: "8px 20px" }}
                                onClick={alertaMasInformacion}
                            >
                                Más información
                            </button>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-container">

                            <div className="column">

                                <div className="form-group" style={{width: '100%'}}>
                                    <AmountButton
                                        value = {monto}
                                        onChange={(val) => {
                                            setMonto(val);
                                            setMontoError("");
                                        }} />

                                    {montoError && (
                                        <p className="error-message">{montoError}</p>
                                    )}
                                </div>


                                <div className="form-group" style={{width: '100%'}}>
                                    <Input
                                        label="Nombre/s"
                                        TYPE="text"
                                        PLACEHOLDER="Nombre completo"
                                        error={errors.nombre}
                                        {...register("nombre", {
                                            required: "El nombre es obligatorio",
                                            pattern: {
                                                value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                                                message: "Solo se permiten letras"
                                            },
                                            validate: (val) => val.trim() === val || "Sin espacios al inicio o final"
                                        })}
                                    />
                                </div>

                                <div className="form-group" style={{ width: '100%' }}>
                                    <Input
                                        label="Apellido Paterno"
                                        TYPE="text"
                                        PLACEHOLDER="Apellido paterno"
                                        error={errors.apellidoP}
                                        {...register("apellidoP", {
                                            required: "El apellido paterno es obligatorio",
                                            pattern: {
                                                value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                                                message: "Solo se permiten letras"
                                            }
                                        })}
                                    />
                                </div>

                                <div className="form-group" style={{ width: '100%' }}>
                                    <Input
                                        label="Apellido Materno"
                                        TYPE="text"
                                        PLACEHOLDER="Apellido materno"
                                        error={errors.apellidoM}
                                        {...register("apellidoM", {
                                            required: "El apellido materno es obligatorio",
                                            pattern: {
                                                value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                                                message: "Solo se permiten letras"
                                            }
                                        })}
                                    />
                                </div>

                                <div className="form-group" style={{ width: '100%' }}>
                                    <Input
                                        label="Correo"
                                        TYPE="text"
                                        PLACEHOLDER="Correo"
                                        error={errors.correo}
                                        {...register("correo", {
                                            required: "El correo es obligatorio",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Formato de correo inválido"},
                                        })}/>
                                </div>

                                <div className="form-group">
                                    <label className="privacy-check">
                                        <input
                                            type="checkbox"
                                            {...register("privacidad", {
                                                required: "Debes aceptar el aviso de privacidad"
                                            })}
                                        />

                                        He leído y acepto el <a className="link" href="https://docs.google.com/document/d/19K4lHxiRcNv1wSrHp0NLWxvSUdIswtFxDjvcZBOGcIQ/edit?usp=drivesdk">Aviso de privacidad</a>
                                    </label>

                                    {errors.privacidad && (
                                        <p className="error-message">
                                            {errors.privacidad.message}
                                        </p>
                                    )}
                                </div>


                                <div style={{ marginTop: "20px", width: "100%" }}>
                                    <PayPalButtons
                                        style={{
                                            layout: "vertical",
                                            color: "white",
                                            shape: "rect",
                                            label: "donate",
                                            height: 45
                                        }}

                                        key={`${isValid}-${monto}`}
                                        disabled={!isValid || !monto || procesandoPago}
                                        onClick={(data, actions) => {
                                            const formData = getValues();
                                            if (!monto || monto <= 0) {
                                                setMontoError("Debes seleccionar un monto");
                                                return actions.reject();
                                            }
                                            if (!formData.privacidad || !isValid) {
                                                alertaError("Por favor, llena correctamente el formulario y acepta el aviso de privacidad.");
                                                return actions.reject();
                                            }
                                            return actions.resolve();
                                        }}
                                        onApprove={async (data) => {
                                            setProcesandoPago(true);

                                            try {
                                                const formData = getValues();

                                                const donationData = {
                                                    ...formData,
                                                    monto,
                                                    paypalOrderId: data.orderID
                                                };

                                                await enviarDatos(
                                                    "/api/Donacion/paypal/capture-order",
                                                    donationData
                                                );

                                                alertaAgradecimiento();
                                                navigate("/pantalla-principal")

                                                reset();
                                                setMonto(null);
                                            } catch (error) {
                                                console.error(error);

                                                if (error.message.includes("503")) {
                                                    alertaError(
                                                        "El servicio de pagos no está disponible temporalmente. Intenta nuevamente en unos minutos."
                                                    );
                                                } else {
                                                    alertaError(
                                                        "No pudimos confirmar tu donación en este momento. Si el cargo se realizó, por favor contacta a la asociación."
                                                    );
                                                }

                                            } finally {
                                                setProcesandoPago(false);
                                            }
                                        }}
                                        createOrder={async () => {
                                            console.log("CREANDO ORDEN");

                                            const response =
                                                await enviarDatos(
                                                    "/api/Donacion/paypal/create-order",
                                                    { monto }
                                                );

                                            console.log("ORDER:", response);

                                            return response.orderId;
                                        }}
                                    />
                                    {procesandoPago && (
                                        <div className="processing-container">
                                            <div className="spinner"></div>
                                            <p>
                                                Procesando tu donación... 💜
                                                <br />
                                                Por favor, no cierres esta ventana.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="form-actions-card">
                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        disabled={procesandoPago}
                                        onClick={()=> navigate("/pantalla-principal")}>
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </PayPalScriptProvider>
    )
}
