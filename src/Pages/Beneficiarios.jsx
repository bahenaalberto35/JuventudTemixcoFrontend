import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Pagination from "../Components/Structure/Pagination.jsx";
import { Header } from "../Components/Structure/Header.jsx";
import BeneficiarioCard from "../Components/Admin/BeneficiarioCard.jsx";
import { alertaExito, alertaCamposVacios, alertaError } from "../Utils/alerts";
import "./ModalGlobal.css";
import Input from "../Components/Inputs/Input.jsx";
import { obtenerDatos } from "../Utils/api.js";
import Select from "../Components/Inputs/Select.jsx";
import { eliminarDatos, actualizarDatos, obtenerArchivo } from "../Utils/api.js";
import { confirmarEliminar } from "../Utils/alerts";

export default function Beneficiarios() {

    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [beneficiarios, setBeneficiarios] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [beneficiarioSeleccionado, setBeneficiarioSeleccionado] = useState(null);
    const [listaMunicipios, setListaMunicipios] = useState([]);
    const [terminoBusqueda, setTerminoBusqueda] = useState("");
    const [fechas, setFechas] = useState({ inicio: "", fin: "" });

    const handleDateChange = (tipo, valor) => {
        console.log(tipo, valor);
    setFechas(prev => ({ ...prev, [tipo]: valor }));
};

useEffect(() => {
  cargarBeneficiarios(); 
}, []);

    useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    cargarBeneficiarios(terminoBusqueda, fechas.inicio, fechas.fin);
  }, 500);
  return () => clearTimeout(delayDebounceFn);
}, [terminoBusqueda, fechas.fin, fechas.inicio]);
    
       const isEditing = !!beneficiarioSeleccionado;
           
               const {
                   register,
                   handleSubmit,
                   reset,
                   watch,
                   setValue,
                   formState: { errors },
               } = useForm({
                   mode: "onChange"
               });
    
               register("id");
           
               useEffect(() => {
                           fetch('https://api.juventudxtemixco.org/api/beneficiarios/Municipios')
                           .then(res => res.json())
                           .then(data => setListaMunicipios(data));}, []);
           
               const onError = () => {
                   if (Object.keys(errors).length > 0) {
                       alertaCamposVacios();
                   }
               };
    
              
    
               const handleEditar = (user) => {

                
        setBeneficiarioSeleccionado(user);
        const idCorrecto = user.id;

        const generoMap = {
            HOMBRE: 0,
            MUJER: 1,
            "NO_BINARIO": 2,
            OTRO: 3
        };
    
        reset({
            id: idCorrecto,
            nombre: user.nombre || "",
            apellidoP: user.apellidoP || "",
            apellidoM: user.apellidoM || "",
           genero: generoMap[user.genero] ?? "",
           id_Municipio: user.id_Municipio || "",
            colonia: user.colonia || "",
            edad: user.edad ?? "",
            correo: user.correo || "",
            telefono: user.telefono || "",
            fotografia: null
        });
    
        const fotoExistente = user.foto
            ? `data:image/jpeg;base64,${user.foto}`
            : null;
    
        setPreviewImage(fotoExistente);
    
        setShowModal(true);
        
    };


    const cargarBeneficiarios = async (termino = "", fechaInicio = "", fechaFin = "") => {
  try {
     
    let url = "/api/beneficiarios" 

    if(fechaInicio && fechaFin) {
        url = `/api/beneficiarios/filtro?fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`;
    }else if (termino) {
        url = `/api/beneficiarios/buscar?nombre=${encodeURIComponent(termino)}&apellidoP=${encodeURIComponent(termino)}&apellidoM=${encodeURIComponent(termino)}`
    }
      
    const data = await obtenerDatos(url);
    
    setBeneficiarios(data || []);
  } catch (error) {
    console.error('Error al cargar beneficiarios:', error);
  }
};

             // SUBMIT PARA AGREGAR Y ENVIAR A BACKEND
           const onSubmit = async (data) => {
               try {
                if (data.nombre) data.nombre = data.nombre.trim()
    
                if (isEditing) {
                    
                    const beneficiarioId = data.id || (beneficiarioSeleccionado && beneficiarioSeleccionado.id);
    
                    if (!beneficiarioId) {
                    alertaError("El beneficiario no contiene un ID válido.");
                    return;
                }
                
                const datosEnviar = {
                    nombre: data.nombre, 
                    apellidoP: data.apellidoP,
                    apellidoM: data.apellidoM,
                    genero: data.genero,   
                    edad: parseInt(data.edad, 10),
                    id_Municipio: data.id_Municipio,
                    colonia: data.colonia,
                    correo: data.correo,
                    telefono: data.telefono,
                    foto: previewImage ? (previewImage.includes(",") ? previewImage.split(",")[1] : previewImage) : null
                };
    
               
                await actualizarDatos(`/api/beneficiarios/${beneficiarioId}`, datosEnviar);
                alertaExito("Beneficiario actualizado correctamente");
            }
                 await cargarBeneficiarios();
                 handleCloseModal();
               } catch (error) {
                 alertaError("Error al procesar la solicitud");
                
               }
             };
       
       
           const handleImageChange = (e) => {
               const file = e.target.files[0];
               if (file) {
                   const reader = new FileReader();
                   reader.onloadend = () => {
                       setPreviewImage(reader.result); 
                   };
                   reader.readAsDataURL(file);
               }
           };
    
    
         const eliminarBeneficiario = async (id) => {
    
            console.log("ID recibido para eliminar:", id); 

        if (!id) {
        console.error("No se puede eliminar sin un ID válido");
        return;
       }
    
            const confirmar = await confirmarEliminar("¿Eliminar al beneficiario?");
            if (confirmar) {
                try {
                   console.log("Eliminando beneficiario");
           await eliminarDatos(`/api/beneficiarios/${id}`);
           await cargarBeneficiarios();
    
            alertaExito("Beneficiario eliminado correctamente");
            
        } catch (error) {
            console.error("Error en eliminar beneficiario:", error);
        }
    }
    }
    const handleDownloadIndividual = async (id) => {
        try {
            // Validamos que el ID exista
            if (!id) return;
            
            const blob = await obtenerArchivo(`/api/reportes/beneficiario/${id}/pdf`);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Credencial_${id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alertaError("Error al descargar la credencial.");
        }
    };


    const handleExportAll = async (beneficiarios, fechas, busqueda) => {
    if (!beneficiarios || beneficiarios.length === 0) {
        alertaError("No hay beneficiarios disponibles para descargar.");
        return;
    }

   
    let url = `/api/reportes/beneficiarios/pdf?`;
    const params = [];

    if (fechas?.inicio && fechas.inicio !== "undefined") {
        params.push(`inicio=${encodeURIComponent(fechas.inicio)}`);
    }
    if (fechas?.fin && fechas.fin !== "undefined") {
        params.push(`fin=${encodeURIComponent(fechas.fin)}`);
    }
  
    if (busqueda && busqueda.trim() !== "") {
        params.push(`busqueda=${encodeURIComponent(busqueda)}`);
    }

    url += params.join("&");
    
    try {
        const blob = await obtenerArchivo(url);
        const descargarUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = descargarUrl;
        a.download = `Reporte_Beneficiario´.pdf`;
        a.click();
        window.URL.revokeObjectURL(descargarUrl);
    } catch (error) {
       alertaError("Error al descargar el reporte de beneficiarios");
    }
};
    
     
    
           
               const handleCloseModal = () => {
                   setShowModal(false);
                   setPreviewImage(null);
                   setBeneficiarioSeleccionado(null);
                   reset();
               };
        return (

            <div style={{ padding: "24px" }}>
                <Header seccion="beneficiarios"
                seccion="beneficiarios"
                onSearch={(valor) => { setTerminoBusqueda(valor) }}
                onDateChange={handleDateChange}
                onExport={() => handleExportAll(beneficiarios, fechas, terminoBusqueda)}
                fechas={fechas} />
    
                <div className="grid-secciones" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>

                    {beneficiarios.length > 0 ? (
        beneficiarios.map((b) => (

            <BeneficiarioCard
                key={b.id} 
                nombre={ b.nombre}
                apellidoP={b.apellidoP}
                apellidoM={b.apellidoM}
                genero={b.genero}
                edad={b.edad}
                telefono={b.telefono}
                municipio={b.municipio}
                colonia={b.colonia}
                correo={b.correo}
                imagen={b.foto ? `data:image/jpeg;base64,${b.foto}` : null}
                onEdit={() => handleEditar(b)}
                onDelete={() => eliminarBeneficiario(b.id)}
                onDownload={() => handleDownloadIndividual(b.id, b)}
                        
            />
        ))
    ) : (
        <p>No se encontraron beneficiarios registrados.</p>
    )}

                </div>
    
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-container-custom">
                            <h2 className="modal-title">{"Editar Beneficiario"}</h2>
    
                            <form onSubmit={handleSubmit(onSubmit, onError)}>
                                <div className="modal-grid-columns">
                                    {/* INPUT SECCIÓN */}
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

                                     <div className="form-group" style={{ width: '100%' }}>
                                       <Select
                                        label="Genero"
                                        error={errors.genero}
                                        value={watch("genero")}
                                        {...register("genero", { required: "El genero es obligatorio" })}>
                                            <option value="">Selecciona una opción</option>
                                            <option value={0}>Hombre</option>
                                             <option value={1}>Mujer</option>
                                              <option value={2}>No binario</option>
                                               <option value={3}>Otro</option>
                                               </Select>
                                    </div>

                                     <div className="form-group" style={{ width: '100%' }}>
                                       <Input
                                        label="Edad"
                                        TYPE="number"
                                        PLACEHOLDER="Edad"
                                        error={errors.edad}
                                        {...register("edad", {
                                            required: "La edad es obligatoria",
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message: "Solo se permiten números y sin espacios"
                                            }
                                        })}
                                        />
                                    </div>

                                </div>

                                <div className="column">
                                     <div className="form-group" style={{ width: '100%' }}>
                                       <Input
                                        label="Teléfono"
                                        TYPE="tel"
                                        PLACEHOLDER="Teléfono"
                                        error={errors.telefono}
                                        {...register("telefono", {
                                            required: "El teléfono es obligatorio",
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message: "Solo se permiten números y sin espacios"
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
                                    message: "Formato de correo inválido"}

                                })}/>
                                </div>

                                     <div className="form-group" style={{ width: '100%' }}>
                                       <Select
                                        label="Municipio"
                                         error={errors.municipio}
                                         {...register("id_Municipio", { required: "El municipio es obligatorio" })}>
                                             <option value="">Selecciona un municipio</option>
                                              {listaMunicipios.map((municipio) => (
                                                 <option key={municipio.id} value={municipio.id}>
                                                    {municipio.nombre}
                                                    </option>
                                                ))}
                                                </Select>
                                    </div>

                                    <div className="form-group" style={{ width: '100%' }}>
                                       <Input
                                        label="Colonia"
                                        TYPE="text"
                                        PLACEHOLDER="Colonia"
                                        error={errors.colonia}
                                        {...register("colonia", {
                                            required: "La colonia es obligatoria",
                                            pattern: {
                                                value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                                                message: "Solo se permiten letras"
                                            }
                                        })}
                                        />
                                    </div>


                                 

                                    {/* IMAGEN */}
                                    <div className="form-group" style={{ width: '100%' }}>
                                        <label className="label">Imagen:</label>
                                        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                                            <div className="modal-input" style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '100px',
                                                borderStyle: previewImage ? 'solid' : 'dashed',
                                                borderColor: errors.imagen ? '#ef4444' : '#d1d5db',
                                                overflow: 'hidden',
                                                padding: '0'
                                            }}>
                                                {previewImage ? (
                                                    <img
                                                        src={previewImage}
                                                        alt="Vista previa"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <span style={{ color: '#878787' }}>+ Añadir imagen</span>
                                                )}
                                            </div>
                                        </label>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            {...register("imagen", { 
                                                required: previewImage ? false : "La imagen es obligatoria",
                                                onChange: handleImageChange 
                                            })}
                                        />
                                        {errors.imagen && <span className="error">La imagen es obligatoria</span>}
    
                                        {previewImage && (
                                            <p style={{ fontSize: '12px', color: '#8E0073', marginTop: '8px', cursor: 'pointer' }}
                                               onClick={() => {setPreviewImage(null);
                                                setValue("imagen", null);
                                               }}>
                                                Cambiar imagen
                                            </p>
                                        )}
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
             </div>
        );
    }
                  
                    
    
    