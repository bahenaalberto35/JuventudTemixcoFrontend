import logoBlanco from '../../Img/logoBlanco.png'
import '../Estilos.css'
import facebook from "../../Img/facebook.png"
import instagram from "../../Img/instagram.png"
import Whats from "../../Img/Whats.png"
import telefono from "../../Img/telefono.png"
import locali from "../../Img/locali.png"
import corre from "../../Img/corre.png"
import {ButtonPieDePagina} from "../Buttons/Button.jsx";
import { useNavigate } from 'react-router-dom'

export default function PieDePagina() {

    const navigate = useNavigate(); 


    return(
<footer className="Piedepagina-card">
    <div className="footer-column ">
    <img src={logoBlanco} alt="logo" className="footer-logo"/>
    
    <div className="contact-info links-verticales">

         <div className="contacto-item">
            <img src={telefono} alt="teléfono" className="icon-small"/>
            <p>+52 777 257 8970</p>
        </div>
        <div className="contacto-item">
            <img src={telefono} alt="teléfono" className="icon-small"/>
            <p>+52 777 134 3182</p>
        </div>
        <div className="contacto-item">
            <img src={telefono} alt="teléfono" className="icon-small"/>
            <p>+52 777 790 5459</p>
        </div>
    </div>
</div>

    <div className="footer-column">
        <h3 className="Titulo-inferior">ENLACES</h3>
        <div className="links-verticales">
        <a href={"#"} className="navegacion-link-Inferior espacio" onClick={(e) => { e.preventDefault(); 
                navigate("/"); }}>Inicio</a>
        <a href={"#"} className="navegacion-link-Inferior espacio" onClick={(e) => { e.preventDefault(); 
                navigate("/voluntariado");   }}>Voluntariado</a>
        <a href={"#"} className="navegacion-link-Inferior espacio"onClick={(e) => { e.preventDefault(); 
                navigate("/secciones");   }}>Programas</a>
        </div>
    </div>

    <div className="footer-column">
        <h3 className="Titulo-inferior">REDES SOCIALES</h3>
        <div className="social-icons-wrapper">
        <a href="https://wa.me/527772578970" className="navegacion-link-Inferior"><img src={Whats} alt="WhatsApp" /></a>
        <a href="https://www.facebook.com/share/1BHRCH3KsL/" className="navegacion-link-Inferior"><img src={facebook} alt="Facebook" /></a>
        <a href="https://www.instagram.com/juventudportemixco?igsh=MThuNmJiOWxzZHBzNw==" className="navegacion-link-Inferior"><img src={instagram} alt="Instagram" /></a>
        </div>
    <div className="extra-info links-verticales">
        <div className="contacto-item">
            <img src={corre} alt="correo" className="icon-small"/>
            <p className="info-pie">juventud.temixco.2019@hotmail.com</p>
        </div>
        <div className="contacto-item">
            <img src={locali} alt="localización" className="icon-small"/>
            <p>Municipio de Temixco</p>
    </div>
    </div>
    </div>


    <div className="footer-column buttons-section">
        <h3 className="Titulo-inferior">ÚNETE A NOSOTROS</h3>
        <ButtonPieDePagina  label="Registrarse" onClick={() => navigate("/registroBeneficiarios")} />
        <ButtonPieDePagina label="Donar" onClick={() => navigate("/donaciones")} />
    </div>

</footer>
    )

}