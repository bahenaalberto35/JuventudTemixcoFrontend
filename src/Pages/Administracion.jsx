import { useState, useEffect } from "react";
import DataTable from "../Components/Admin/Datatable.jsx";
import { Header } from "../Components/Structure/Header.jsx";
import { useForm, Controller } from "react-hook-form";
import Input from "../Components/Inputs/Input.jsx";
import { alertaCamposVacios, alertaError, alertaExito, confirmarEliminar } from "../Utils/alerts.js";
import { obtenerDatos, actualizarDatos, eliminarDatos, enviarDatos } from "../Utils/api.js";
import Pagination from "../Components/Structure/Pagination.jsx";

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

function InputField({ label, type = "text", placeholder, value, onChange, error, ...props }) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (visible ? "text" : "password") : type;

    return (
        <div className="lf-field">
            <label className="lf-label">{label}</label>
            <div className="lf-input-wrap">
                <input
                    className={`lf-input ${error ? "lf-input--error input-error" : ""}`}
                    type={inputType}
                    placeholder={placeholder}
                    value={value || ""}
                    onChange={onChange}
                    {...props}
                    autoComplete={isPassword ? "new-password" : "email"}
                />
                {isPassword && (
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
                )}
            </div>
            {error && (
                <p className="np-field-error" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {error.message || error}
                </p>
            )}
        </div>
    );
}

const columns = [
    { key: "nombre", label: "Nombre completo" },
    { key: "correo", label: "Correo electrónico" },
];

export default function Administracion() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [AdministradorSeleccionado, setAdministradorSeleccionado] = useState(null);
    const [terminoBusqueda, setTerminoBusqueda] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        watch,
        control,
        formState: { errors },
    } = useForm({ mode: "onChange" });

    // Escuchamos los campos en tiempo real para las reglas dinámicas
    const passwordValue = watch("contrasena") || "";
    const confirmValue = watch("confirmarPassword") || "";

    /* Cálculos de Fuerza en Tiempo Real */
    const results = RULES.map((r) => ({ ...r, passed: r.test(passwordValue) }));
    const passed = results.filter((r) => r.passed).length;
    const allPass = passed === RULES.length;
    const strength = passwordValue.length > 0 ? strengthLabel(passed) : null;

    useEffect(() => {
        cargarAdministradores();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            cargarAdministradores(terminoBusqueda);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [terminoBusqueda]);

    const handleEdit = (row, index) => {
        handleEditar(row);
    };

    const handleEditar = (user) => {
        reset({
            id: user.id,
            nombre: user.nombre,
            apellidoP: user.apellidoP || "",
            apellidoM: user.apellidoM || "",
            correo: user.correo,
            contrasena: "",
            confirmarPassword: ""
        });
        setAdministradorSeleccionado(user);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleOpenModal = (editMode = false, user = null) => {
        setIsEditing(editMode);
        if (editMode && user) {
            handleEditar(user);
        } else {
            setAdministradorSeleccionado(null);
            reset({
                nombre: "",
                apellidoP: "",
                apellidoM: "",
                correo: "",
                contrasena: "",
                confirmarPassword: ""
            });
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        reset();
    };

    const cargarAdministradores = async (termino = "") => {
        try {
            const url = termino
                ? `/api/admin/buscar?nombre=${encodeURIComponent(termino)}`
                : '/api/admin';
            const data = await obtenerDatos(url);
            setAdmins(data || []);
        } catch (error) {
            console.error('Error al cargar Administradores:', error);
        }
    };

    const onSubmit = async (data) => {
        try {
            data.nombre = data.nombre?.trim();

            if (isEditing && !data.contrasena) {
                delete data.contrasena;
                delete data.confirmarPassword;
            }

            if (isEditing && AdministradorSeleccionado) {
                await actualizarDatos(`/api/admin/${AdministradorSeleccionado.id}`, data);
                alertaExito("Administrador actualizado correctamente");
            } else {
                await enviarDatos('/api/admin', data);
                alertaExito("Administrador guardado correctamente");
            }

            cargarAdministradores();
            setShowModal(false);
            reset();
        } catch (error) {
            alertaError("Error al procesar la solicitud");
            console.error("Error:", error);
        }
    };

    const onError = () => {
        if (Object.keys(errors).length > 0) {
            alertaCamposVacios();
        }
    };

    const eliminarAdministrador = async (id) => {
        const confirmar = await confirmarEliminar("¿Eliminar Administrador?");
        if (confirmar) {
            try {
                await eliminarDatos(`/api/admin/${id}`);
                alertaExito("Administrador eliminado correctamente");
                cargarAdministradores();
            } catch (error) {
                alertaError("No se pudo eliminar el Administrador");
            }
        }
    };

    return (
        <div style={{ padding: "24px" }}>
            <div>
                <Header seccion="administracion" onAdd={() => handleOpenModal(false)}
                        onSearch={(valor) => setTerminoBusqueda(valor)} />
                <DataTable
                    columns={columns}
                    rows={admins}
                    onEdit={handleEdit}
                    onDelete={(row) => eliminarAdministrador(row.id)}
                />
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container-custom">
                        <h2 className="modal-title">
                            {isEditing ? "Editar Administrator" : "Agregar Administrador"}
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit, onError)}>
                            <div className="modal-grid-columns">
                                <div className="column">
                                    <div className="form-group" style={{ width: '100%' }}>
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
                                </div>

                                <div className="column">
                                    <div className="form-group" style={{ width: '100%' }}>
                                        <Input
                                            label="Correo electrónico"
                                            TYPE="text"
                                            PLACEHOLDER="Correo electrónico"
                                            error={errors.correo}
                                            {...register("correo", {
                                                required: "El correo electrónico es obligatorio",
                                                pattern: {
                                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                    message: "Ingrese un correo electrónico válido"
                                                }
                                            })}
                                        />
                                    </div>

                                    {/* CONTRASEÑA UTILIZANDO CONTROLLER PARA EL MANEJO DE PASSED */}
                                    <div className="form-group" style={{ width: '100%' }}>
                                        <Controller
                                            name="contrasena"
                                            control={control}
                                            rules={{
                                                required: isEditing ? false : "La contraseña es obligatoria",
                                                validate: (value) => {

                                                    if (isEditing && !value) return true;

                                                    const pasadas = RULES.filter((r) => r.test(value || "")).length;
                                                    return pasadas === RULES.length || "La contraseña no cumple todos los requisitos.";
                                                }
                                            }}
                                            render={({ field }) => (
                                                <InputField
                                                    label="Contraseña:"
                                                    type="password"
                                                    placeholder={isEditing ? "Dejar en blanco para conservar la actual" : "Contraseña"}
                                                    error={errors.contrasena}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />

                                        {passwordValue.length > 0 && (
                                            <div className="np-strength" style={{ marginTop: '10px' }}>
                                                <div className="np-strength-bar">
                                                    {RULES.map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className="np-strength-seg"
                                                            style={{ background: i < passed ? strength.color : "#e0e0e0" }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="np-strength-label" style={{ color: strength.color, fontWeight: 'bold', fontSize: '13px' }}>
                                                    {strength.text}
                                                </span>

                                                <ul className="np-rules" style={{ listStyle: 'none', paddingLeft: 0, marginTop: '8px' }}>
                                                    {results.map((r) => (
                                                        <li key={r.id} className={`np-rule ${r.passed ? "np-rule--ok" : "np-rule--fail"}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: r.passed ? '#16a34a' : '#dc2626' }}>
                                                            <span className="np-rule-icon">{r.passed ? "✓" : "✗"}</span>
                                                            {r.label}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* CONFIRMAR CONTRASEÑA */}
                                    <div className="form-group" style={{ width: '100%' }}>
                                        <Controller
                                            name="confirmarPassword"
                                            control={control}
                                            rules={{
                                                validate: (value) => {

                                                    if (isEditing && !passwordValue && !value) return true;

                                                    if (passwordValue && !value) return "Confirmar la contraseña es obligatorio";

                                                    return value === passwordValue || "Las contraseñas no coinciden";
                                                }
                                            }}
                                            render={({ field }) => (
                                                <InputField
                                                    label="Confirmar contraseña:"
                                                    type="password"
                                                    placeholder={isEditing ? "Dejar en blanco para conservar la actual" : "Repite tu contraseña"}
                                                    error={errors.confirmarPassword}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar" onClick={handleCloseModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-guardar">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}