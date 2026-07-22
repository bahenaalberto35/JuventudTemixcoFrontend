import Encabezado from "../Components/Structure/Encabezado";
import './ModalGlobal.css';
import InfoVoluntariado from "../Components/Informacion/InfoVoluntariado";
import Voluntariado from "../Components/Informacion/voluntariado";
import voluntariado1 from "../Img/voluntariado1.png";
import voluntariado2 from "../Img/voluntariado2.png";
import voluntariado3 from "../Img/voluntariado3.png";
import voluntariado4 from "../Img/voluntariado4.png";
import VoluntariadoRegis from "../Components/Informacion/voluntariadoRegis";
import PieDePagina from "../Components/Structure/PieDePagina.jsx";

export default function PaginaVoluntariado() {
    return (
        /* Agregamos una clase contenedora global */
        <div className="pagina-contenedor-global">
            <Encabezado />

            <section className="card-informacion">
                <InfoVoluntariado />
            </section>

            <section className="seccion-caminos">
                <h2 className="subtitulo-pantalla2">Caminos para colaborar</h2>

                <div className="card-pantalla">
                    <div className="fila">
                        <Voluntariado className="card-morada" imagen={voluntariado1} texto="Diseño de protocolos de atención para personas en situación de vulnerabilidad." />
                        <Voluntariado className="card-morado2" imagen={voluntariado2} texto="Organización de talleres de salud emocional y nutrición (usando los alimentos de la canasta básica)." />
                        <Voluntariado className="card-morado3" imagen={voluntariado3} texto="Evaluación del impacto social: ¿Cómo mejoró la salud  de la colonia tras la intervención?" />
                    </div>
                </div>

                <div className="fila">
                    <Voluntariado className="card-morado4" imagen={voluntariado4} texto="Programa de intervención integral para el bienestar comunitario en zonas vulnerables." />
                </div>
            </section>

            <section className="seccion-registro-pasos">
                <h2 className="subtitulo-pantalla2">¿Cómo empezar?</h2>
                <div className="registro-componente-wrapper">
                    <VoluntariadoRegis/>
                </div>
            </section>

            <footer>
                <PieDePagina />
            </footer>
        </div>

    );
}