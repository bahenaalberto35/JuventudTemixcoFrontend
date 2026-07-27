import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Pagination from "../Components/Structure/Pagination.jsx";
import { Header } from "../Components/Structure/Header.jsx";
import SectionCard from "../Components/Admin/SectionCard.jsx";
import { alertaExito, alertaCamposVacios, confirmarEliminar, alertaError } from "../Utils/alerts";
import Input from "../Components/Inputs/Input.jsx";
import TextArea from "../Components/Inputs/TextArea.jsx";
import FileInput from "../Components/Inputs/FileInput.jsx";
import "./ModalGlobal.css";

import { obtenerDatos, eliminarDatos } from "../Utils/api.js";

const BASE_URL = "https://api.juventudxtemixco.org";

const MIMES_PERMITIDOS = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/svg+xml',
];

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function Secciones() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_POR_PAGINA = 10;
    const [showModal, setShowModal] = useState(false);
    const [secciones, setSecciones] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [archivo, setArchivo] = useState(null);
    const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageVersion, setImageVersion] = useState(Date.now());

    const isEditing = !!seccionSeleccionada;

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({ mode: "onChange" });

    const descripcionActual = watch("descripcion", "");

    // Cargar secciones
    const cargarSecciones = async () => {
        try {
            setLoading(true);
            const data = await obtenerDatos('/api/section');

            if (Array.isArray(data)) {
                const paginas = Math.ceil(data.length / ITEMS_POR_PAGINA);
                setTotalPages(paginas === 0 ? 1 : paginas);
                setSecciones(data);
            } else {
                setSecciones([]);
                setTotalPages(1);
            }

            setImageVersion(Date.now());
        } catch (error) {
            alertaError("Ocurrió un error al cargar las secciones");
            console.error('Error al cargar las Secciones: ', error);
            setSecciones([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const iniciarDatos = async () => {
            try {
                await cargarSecciones();
            } catch (error) {
                alertaError("Ocurrió un error al cargar las secciones");
                console.error("Error al cargar secciones:", error);
            }
        };

        iniciarDatos();
    }, []);

    // Abrir modal
    const handleOpenModal = (sec = null) => {
        setSeccionSeleccionada(sec);
        setArchivo(null);

        if (sec) {
            reset({ nombre: sec.name || "", descripcion: sec.description || "" });
            setPreviewImage(`${BASE_URL}/api/section/imagen/${sec.id}`);
        } else {
            reset({ nombre: "", descripcion: "" });
            setPreviewImage(null);
        }
        setShowModal(true);
    };

    // Cambio de imagen
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!MIMES_PERMITIDOS.includes(file.type)) {
            alertaError("Solo se permiten archivos JPEG, PNG o SVG");
            e.target.value = "";
            return;
        }

        if (file.size > MAX_SIZE_BYTES) {
            alertaError(`El archivo no debe exceder los ${MAX_SIZE_MB}MB`);
            e.target.value = "";
            return;
        }

        setArchivo(file);
        setPreviewImage(URL.createObjectURL(file));
    };

    // Submit (POST/PUT)
    const onSubmit = async (data) => {
        try {
            const token = localStorage.getItem("token");
            const headers = {};

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            if (!isEditing && !archivo) {
                alertaError("La imagen es obligatoria para crear una sección");
                return;
            }

            const formData = new FormData();
            formData.append("name", data.nombre.trim());
            formData.append("description", data.descripcion.trim());
            if (archivo) {
                formData.append("archivo", archivo);
            }

            let url;
            let metodo;

            if (isEditing) {
                url = `${BASE_URL}/api/section/update/${seccionSeleccionada.id}`;
                metodo = "POST";
            } else {
                url = `${BASE_URL}/api/section`;
                metodo = "POST";
            }

            const respuesta = await fetch(url, {
                method: metodo,
                headers: headers,
                body: formData,
                credentials: 'include',
            });

            if (!respuesta.ok) {
                if (respuesta.status === 404) {
                    throw new Error("El texto introducido es demasiado largo.");
                }
                throw new Error(`Error en el servidor: ${respuesta.status}`);
            }

            alertaExito(isEditing ? "Sección actualizada correctamente" : "Sección creada correctamente");
            await cargarSecciones();
            handleCloseModal();
        } catch (error) {
            alertaError(error.message || "Error al procesar la solicitud");
            console.error(error);
        }
    };

    // Delete
    const eliminar = async (id) => {
        const confirmar = await confirmarEliminar("¿Eliminar esta sección?");
        if (confirmar) {
            try {
                await eliminarDatos(`/api/section/${id}`);

                if (currentPage > 1 && secciones.length % ITEMS_POR_PAGINA === 1) {
                    setCurrentPage(prev => prev - 1);
                }

                await cargarSecciones();
                alertaExito("Sección eliminada correctamente");
            } catch (error) {
                let mensajeAmigable = "No se pudo eliminar la sección";

                try {
                    const objetoError = JSON.parse(error.message);
                    if (objetoError && objetoError.message) {
                        mensajeAmigable = objetoError.message;
                    }
                } catch (e) {
                    if (error.message) mensajeAmigable = error.message;
                }

                alertaError(mensajeAmigable);
                console.error("Error al eliminar la sección: ", error);
            }
        }
    };

    // cerrar modal
    const handleCloseModal = () => {
        setShowModal(false);
        setPreviewImage(null);
        setSeccionSeleccionada(null);
        setArchivo(null);
        reset();
    };

    const onError = () => {
        if (Object.keys(errors).length > 0) {
            alertaCamposVacios();
        }
    };

    const getImagenUrl = (id) => `${BASE_URL}/api/section/imagen/${id}?v=${imageVersion}`;

    // Lógica para el buscador
    const handleSearch = async (busqueda) => {
        try {
            setLoading(true);
            const data = await obtenerDatos(`/api/section/byName?name=${encodeURIComponent(busqueda)}`);

            if (Array.isArray(data)) {
                setSecciones(data);
                const paginas = Math.ceil(data.length / ITEMS_POR_PAGINA);
                setTotalPages(paginas === 0 ? 1 : paginas);
            } else {
                setSecciones([]);
                setTotalPages(1);
            }
            setCurrentPage(1);
            setImageVersion(Date.now());
        } catch (error) {
            alertaError("Ocurrió un error al buscar las secciones");
            console.error(error);
            setSecciones([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            minHeight: "calc(100vh - 48px)",
            justifyContent: "space-between"
        }}>
            {/* Contenedor Superior */}
            <div style={{ width: "100%" }}>
                <Header seccion="secciones" onAdd={() => handleOpenModal(null)} onSearch={handleSearch} />

                {/* Renderizado de estados controlado */}
                {loading ? (
                    <div style={{ textAlign: "center", marginTop: "50px", color: "#666" }}>
                        <p>Cargando secciones...</p>
                    </div>
                ) : secciones.length > 0 ? (
                    <div
                        className="grid-secciones"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: '24px',
                            marginTop: '30px',
                            justifyContent: 'center',
                            justifyItems: 'center'
                        }}
                    >
                        {secciones
                            .slice((currentPage - 1) * ITEMS_POR_PAGINA, currentPage * ITEMS_POR_PAGINA)
                            .map((sec) => (
                                <SectionCard
                                    key={sec.id}
                                    titulo={sec.name}
                                    descripcion={sec.description}
                                    imagen={getImagenUrl(sec.id)}
                                    onEdit={() => handleOpenModal(sec)}
                                    onDelete={() => eliminar(sec.id)}
                                />
                            ))
                        }
                    </div>
                ) : (
                    <div style={{ textAlign: "center", marginTop: "80px", color: "#999", fontSize: "1.1rem" }}>
                        <p>No se encontraron secciones registradas.</p>
                    </div>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container-custom">
                        <h2 className="modal-title">
                            {isEditing ? "Editar Sección" : "Agregar Sección"}
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit, onError)}>
                            <div className="modal-center">

                                <Input
                                    label="Sección:"
                                    type="text"
                                    placeholder="Nombre de la sección"
                                    error={errors.nombre}
                                    {...register("nombre", {
                                        required: "El nombre de la sección es obligatorio",
                                        validate: (val) =>
                                            val.trim() === val || "No se permiten espacios al inicio o final",
                                    })}
                                />

                                <TextArea
                                    label="Descripción:"
                                    placeholder="Descripción"
                                    error={errors.descripcion}
                                    style={{ minHeight: '100px' }}
                                    {...register("descripcion", {
                                        required: "La descripción es obligatoria",
                                        validate: (val) =>
                                            val.trim() === val || "Sin espacios al inicio o final",
                                    })}
                                    maxLength={255}
                                />
                                <small style={{ color: descripcionActual.length > 255 ? "#ef4444" : "#8E0073", display: "block", marginTop: "2px" }}>
                                    {descripcionActual.length} / 255 caracteres
                                </small>

                                <FileInput
                                    label="Imagen:"
                                    previewImage={previewImage}
                                    error={errors.imagen}
                                    accept={MIMES_PERMITIDOS.join(',')}
                                    {...register("imagen", {
                                        required: !isEditing ? "La imagen es obligatoria" : false,
                                    })}
                                    onChange={handleImageChange}
                                />

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