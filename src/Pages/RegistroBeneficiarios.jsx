import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { alertaExito, alertaCamposVacios, alertaError } from "../Utils/alerts.js";
import Input  from "../Components/Inputs/Input.jsx";
import "./ModalGlobal.css"; 
import { useNavigate } from 'react-router-dom';
import { enviarDatos } from '../Utils/api.js';
import { useEffect } from 'react';
import Select from '../Components/Inputs/Select.jsx';

export default function RegistroBeneficiarios() {

    const navigate = useNavigate();


    const [currentPage, setCurrentPage] = useState(1);
           const [showModal, setShowModal] = useState(false);
           const [beneficiarios, setBeneficiarios] = useState([]);
           const [previewImage, setPreviewImage] = useState(null);
           const [listaMunicipios, setListaMunicipios] = useState([]);
           
           useEffect(() => {
            fetch('https://api.juventudxtemixco.org/api/beneficiarios/Municipios')
            .then(res => res.json())
            .then(data => setListaMunicipios(data));}, []);



           
           
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
           
               const onSubmit = async (data) => {
                   try {
                       const payload = {
                           nombre: data.nombre.trim(),
                           apellidoP: data.apellidoP.trim(),
                           apellidoM: data.apellidoM.trim(),
                           genero: data.genero,           
                           edad: parseInt(data.edad, 10),
                           telefono: data.telefono.trim(),
                           id_Municipio: data.id_Municipio.trim(),
                           colonia: data.colonia.trim(),
                           correo: data.correo.trim(),
                           foto: previewImage ? previewImage.split(',')[1] : null 
                       };
               
                       await enviarDatos('/api/beneficiarios', payload);
                       
                       alertaExito("Beneficiario registrado con éxito");
                       setPreviewImage(null);
                       setShowModal(false);
                       reset();
                       
                   } catch (error) {
                    if (error.response?.status === 409) {
                         alertaError("Este correo ya está en uso. Intenta con otro.");
                        }else{
                       alertaError("Error al procesar la solicitud");
                        }
                       console.error("Error:", error);
                        
                   }
               };
               const onError = () => {
                   if (Object.keys(errors).length > 0) {
                       alertaCamposVacios();
                   }
               };
           
               const handleRegistrar = (user) => {
               reset({
                   id: user.id,
                   nombres: user.nombre,
                   apellidoP: user.apellidoP || "",
                   apellidoM: user.apellidoM || "",
                   genero: user.genero || "",
                   edad: user.edad || "",
                   telefono: user.telefono || "",
                   id_Municipio: user.id_Municipio || "",
                    colonia: user.colonia || "",
                    correo: user.correo || "",
                   fotografia: null
               });
               if (user.fotografia) {
                   setPreviewImage(user.fotografia);
               }
               setShowModal(true);
           
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
           
              

    return (
         <div className="registro-page-bg">
            <div className="registro-card-view">
                <div className="registro-header"></div>
            <h1 className="registro-title-main">Registro de Beneficiarios</h1>
            <p className="registro-text-welcome">¡Bienvenido al registro de beneficiarios! Por favor, completa el siguiente formulario para unirte.</p>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="form-container">
                                               <div className="modal-grid-columns">
                                                   {/* INPUT SECCIÓN */}
                                                   <div className="column">
                                                   <div className="form-group" style={{ width: '100%' }}>
                                                       <Input
                                                       label="Nombre/s"
                                                       TYPE="text"
                                                       PLACEHOLDER="Nombre completo"
                                                       error={errors.nombres}
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
                                                               message: "Solo se permiten números"
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
                                                            message: "Formato de correo inválido"},
                                                            validate: async (value) => {
                                                                try {
                                                                    const response = await fetch(`https://api.juventudxtemixco.org/api/beneficiarios/verificarCorreo?email=${encodeURIComponent(value)}`);
                                                                    const existe = await response.json();
                                                                    return !existe || "Este correo ya está registrado";
                                                                } catch (error) {
                                                                    return "Error al verificar el correo";
                                                                }
                                                            }
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
                                                                                                 </option>))}
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
                                            </div>
                                                   
                                <div className="form-container">
                                    <div className="form-actions-card">
                                <button type="button" className="btn-cancelar"  onClick={()=> navigate("/pantalla-principal")}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-guardar">
                                    Guardar
                     </button>
                     </div>
            </div>
                                     
                                           
        </form>

     </div>
     </div>
    );
}
                                 
