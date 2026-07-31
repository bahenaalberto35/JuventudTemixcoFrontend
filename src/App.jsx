import { Routes, Route, Navigate } from "react-router-dom";

import PantallaPrincipal from "./Pages/PantallaPrincipal.jsx";

import PaginaSecciones from "./Pages/Secciones/PaginaSecciones.jsx";
import DetalleSeccion from "./Pages/Secciones/DetalleSeccion.jsx";
import PaginaVoluntariado from "./Pages/PaginaVoluntariado.jsx";
import RegistroBeneficiarios from "./Pages/RegistroBeneficiarios.jsx";
import RegistroAfiliados from "./Pages/RegistroAfiliados.jsx";

import Login from "./Auth/Login.jsx";
import ForgotPassword from "./Auth/ForgotPassword.jsx";
import NewPassword from "./Auth/NewPasword.jsx";
import VerifyCode from "./Auth/VerifyCode.jsx";

import Donaciones from "./Pages/Donaciones.jsx";

import Beneficiarios from "./Pages/Beneficiarios.jsx";
import Afiliados from "./Pages/Afiliados";
import Administracion from "./Pages/Administracion";
import Programas from "./Pages/Programas";
import Secciones from "./Pages/Secciones";
import Alianzas from "./Pages/Alianzas";
import Objetivos from "./Pages/Objetivos.jsx";

import ProtectedRoutes from "./Routes/ProtectedRoutes.jsx";
import PublicOnlyRoutes from "./Routes/PublicOnlyRoutes.jsx";
import AdminLayout from "./Routes/AdminLayout.jsx";
import {SeccionesProvider} from "./Pages/Secciones/SeccionesContext.jsx";

import ScrollToTop from "./Components/Scroll/ScrollToTop.jsx";

export default function App() {
    return (

        <>
            <ScrollToTop/>

            <Routes>

                {/*Rutas publicas*/}
                <Route path="/" element={<PantallaPrincipal />} />
                <Route path="/voluntariado" element={<PaginaVoluntariado />} />
                <Route path="/registroBeneficiarios" element={<RegistroBeneficiarios />} />
                <Route path="/registroAfiliados" element={<RegistroAfiliados />} />

                <Route path="/donaciones" element={<Donaciones/>} />

                <Route path="/secciones"
                       element={
                           <SeccionesProvider>
                               <PaginaSecciones />
                           </SeccionesProvider>

                       } />

                <Route
                    path="/secciones/:slug"
                    element={
                        <SeccionesProvider>
                            <DetalleSeccion />
                        </SeccionesProvider>
                    }
                />

                {/*Invitados*/}
                <Route element={<PublicOnlyRoutes />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgotPassword" element={<ForgotPassword />} />
                    <Route path="/newPassword" element={<NewPassword />} />
                    <Route path="/verify" element={<VerifyCode />} />
                </Route>

                {/*Rutas privadas*/}
                <Route
                    element={
                        <ProtectedRoutes
                            allowedRoles={["ROLE_ADMIN"]}
                        />
                    }
                >
                    <Route path="/admin" element={<AdminLayout />} >
                        <Route path="beneficiarios" element={<Beneficiarios />} />

                        <Route path="afiliados" element={<Afiliados />} />

                        <Route path="administracion" element={<Administracion />} />

                        <Route path="programas" element={<Programas />} />

                        <Route path="secciones" element={<Secciones />} />

                        <Route path="alianzas" element={<Alianzas />} />

                        <Route path="objetivos" element={<Objetivos />} />

                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>

        </>


    );
}