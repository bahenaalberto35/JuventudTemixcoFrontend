import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Header } from "../Components/Structure/Header.jsx";
import ImageCard from "../Components/Admin/ImageCard.jsx";
import Pagination from "../Components/Structure/Pagination.jsx";
import { alertaExito, alertaCamposVacios, confirmarEliminar, alertaError } from "../Utils/alerts";
import Select from "../Components/Inputs/Select.jsx";
import FileInput from "../Components/Inputs/FileInput.jsx";
import "./ModalGlobal.css";

import { obtenerDatos, eliminarDatos} from "../Utils/api.js";

const BASE_URL = "https://api.juventudxtemixco.org";

const MIMES_PERMITIDOS = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/svg+xml',
    'video/mp4',
];

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function Programas() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_POR_PAGINA = 10;
    const [showModal, setShowModal] = useState(false);
    const [programas, setProgramas] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [archivo, setArchivo] = useState(null);
    const [programaSeleccionado, setProgramaSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageVersion, setImageVersion] = useState(Date.now());
    const [secciones, setSecciones] = useState([]);

    const isEditing = !!programaSeleccionado;

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm({mode: "onChange"});


    // Cargar programas
    const cargarProgramas = async () => {
        try {
            setLoading(true);
            const data = await obtenerDatos('/api/program');

            if (Array.isArray(data)) {
                const paginas = Math.ceil(data.length / ITEMS_POR_PAGINA);
                setTotalPages(paginas === 0 ? 1 : paginas);
                setProgramas(data);
            } else {
                setProgramas([]);
                setTotalPages(1);
            }

            setImageVersion(Date.now());
        } catch (error) {
            alertaError("Ocurrió un error al cargar los programas");
            console.error('Error al cargar los programas: ', error);
            setProgramas([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const cargarSecciones = async () => {
        try {
            const data = await obtenerDatos('/api/section');
            setSecciones(data);
        } catch (error) {
            alertaError("Ocurrió un error al cargar las secciones de programas");
            console.error("Error al cargar secciones: ", error);
        }
    }

    useEffect(() => {
        const iniciarDatos = async () => {
            try {
                await cargarProgramas();
                await cargarSecciones();
            } catch (error) {
                alertaError("Ocurrió un error al cargar los programas");
                console.error("Error al cargar los programas: ", error);
            }
        };

        iniciarDatos();
    }, []);

    // Funciones de Modal
    const handleOpenModal = (prog = null) => {
        setProgramaSeleccionado(prog);
        setArchivo(null);

        if (prog) {
            reset({seccion_id: prog.sectionId || ""});
            setPreviewImage(`${BASE_URL}/api/program/file/${prog.id}`)
        } else {
            reset({ seccion_id: "" });
            setPreviewImage(null);
        }
        setShowModal(true);
    };

    //Cambiar la imagen
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!MIMES_PERMITIDOS.includes(file.type)) {
            alertaError("Solo se permiten archivos JPEG, PNG, SVG o MP4");
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

    const onSubmit = async (data) => {
        try {
            if (!isEditing && !archivo) {
                alertaError("La imagen es obligatoria para la sección de programas");
                return;
            }

            const formData = new FormData();
            formData.append("section_id", data.seccion_id);
            if (archivo) {
                formData.append("archivo", archivo);
            }

            let url;
            let metodo;

            if (isEditing) {
                url = `${BASE_URL}/api/program/update/${programaSeleccionado.id}`;
                metodo = "POST";
            } else {
                url = `${BASE_URL}/api/program`;
                metodo = "POST";
            }

            const token = localStorage.getItem("token");
            const headers = {};

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const respuesta = await fetch(url, {
                method: metodo,
                headers: headers,
                body: formData,
                credentials: 'include',
            });

            if (!respuesta.ok) {
                throw new Error(`Error en el servidor: ${respuesta.status}`);
            }

            alertaExito(isEditing ? "Programa actualizado correctamente" : "Imagen agregada correctamente al programa");
            await cargarProgramas();
            handleCloseModal();
        } catch (error) {
            alertaError("Error al procesar la solicitud");
            console.error(error);
        }
    };

    // Delete
    const eliminarPrograma = async (id) => {
        const confirmar = await confirmarEliminar("¿Eliminar esta imagen del programa?");

        if (confirmar) {
            try {
                await eliminarDatos(`/api/program/${id}`);

                if (currentPage > 1 && programas.length % ITEMS_POR_PAGINA === 1) {
                    setCurrentPage(prev => prev - 1);
                }

                await cargarProgramas();
                alertaExito("Imagen eliminada correctamente");
            } catch (error) {
                alertaError("No se pudo eliminar la imagen del programa");
                console.error("Error al eliminar la imagen del programa: ", error);
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setPreviewImage(null);
        setProgramaSeleccionado(null);
        setArchivo(null);
        reset();
    };

    const onError = () => {
        if (Object.keys(errors).length > 0) {
            alertaCamposVacios();
        }
    };

    const getImagenUrl = (id) => `${BASE_URL}/api/program/file/${id}?v=${imageVersion}`;

    //Buscador
    const handleSearch = async (busqueda) => {
        try {
            setLoading(true);
            const data = await obtenerDatos(`/api/program/bySectionName?sectionName=${encodeURIComponent(busqueda)}`);

            if (Array.isArray(data)) {
                setProgramas(data);
                const paginas = Math.ceil(data.length / ITEMS_POR_PAGINA);
                setTotalPages(paginas === 0 ? 1 : paginas);
            } else {
                setProgramas([]);
                setTotalPages(1);
            }
            setCurrentPage(1); // Reiniciar a la primera página tras buscar
            setImageVersion(Date.now());
        } catch (error) {
            alertaError("Ocurrió un error al buscar las imagenes por porgrama");
            console.error(error);
            setProgramas([]);
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
                <Header seccion="programas" onAdd={() => handleOpenModal(false)} onSearch={handleSearch} />

                {/* Renderizado de estados */}
                {loading ? (
                    <div style={{ textAlign: "center", marginTop: "50px", color: "#666" }}>
                        <p>Cargando programas...</p>
                    </div>
                ) : programas.length > 0 ? (
                    <div className="grid-programas"
                         style={{
                             display: 'grid',
                             gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                             gap: '24px',
                             marginTop: '30px',
                             justifyContent: 'center',
                             justifyItems: 'center'
                         }}
                    >
                        {programas
                            .slice((currentPage - 1) * ITEMS_POR_PAGINA, currentPage * ITEMS_POR_PAGINA)
                            .map((prog) => (
                                <ImageCard
                                    key={prog.id}
                                    titulo={prog.sectionName}
                                    imagen={getImagenUrl(prog.id)}
                                    onEdit={() => handleOpenModal(prog)}
                                    onDelete={() => eliminarPrograma(prog.id)}
                                />
                            ))
                        }
                    </div>
                ) : (
                    <div style={{ textAlign: "center", marginTop: "80px", color: "#999", fontSize: "1.1rem" }}>
                        <p>No se encontraron programas registrados.</p>
                    </div>
                )}
            </div>

            {/* MODAL PROGRAMAS */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container-custom">
                        <h2 className="modal-title">
                            {isEditing ? "Editar Programa" : "Agregar Programa"}
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit, onError)}>
                            <div className="modal-center">

                                <Select
                                    label="Sección:"
                                    error={errors.seccionId}
                                    {...register("seccion_id", { required: "Debes elegir a qué sección se añadirá la imagen del programa" })}
                                >
                                    <option value="">Seleccionar</option>
                                    {secciones.map((sec) => (
                                        <option key={sec.id} value={sec.id}>
                                            {sec.name}
                                        </option>
                                    ))}
                                </Select>

                                <FileInput
                                    label="Imagen:"
                                    previewImage={previewImage}
                                    error={errors.imagen}
                                    accept={MIMES_PERMITIDOS.join(',')}
                                    {...register("imagen", {
                                        required: !isEditing ? "La imagen es obligatoria" : false
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