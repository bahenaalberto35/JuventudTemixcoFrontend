import { useParams, useNavigate } from 'react-router-dom';
import Encabezado from '../../Components/Structure/Encabezado.jsx';
import PieDePagina from '../../Components/Structure/PieDePagina.jsx';
import HeaderProgramas from '../../Components/Informacion/HeaderProgramas.jsx';
import TarjetaImagen from "../../Components/Programas/TarjetaImagen.jsx";
import { useSecciones } from './SeccionesContext.jsx';
import {useEffect, useState} from "react";


export default function DetalleSeccion() {

    const BASE_URL = "https://api.juventudxtemixco.org";

    const { slug } = useParams();
    const { obtenerPorSlug, loading } = useSecciones();
    const navigate = useNavigate();

    const seccion = obtenerPorSlug(slug);

    const [imagenes, setImagenes] = useState([]);
    const [loadingImagenes, setLoadingImagenes] = useState(true);

    useEffect(() => {

        if (!seccion?.id) return;

        const cargarImagenes = async () => {

            try {

                setLoadingImagenes(true);

                const res = await fetch(
                    `${BASE_URL}/api/section/${seccion.id}/programs`,
                    {
                        credentials: "include",
                    }
                );

                const programas = await res.json();

                const imgs = programas
                    .filter(p => p.image !== null)
                    .map(p => ({
                        id: p.id,
                        url: `${BASE_URL}/api/section/program/image/${p.id}`,
                        descripcion: p.name ?? "",
                    }));

                setImagenes(imgs);

            } catch (e) {
                console.error(e);
            } finally {
                setLoadingImagenes(false);
            }

        };

        cargarImagenes();

    }, [seccion]);

    if (loading || loadingImagenes) {
        return (
            <>
                <Encabezado />
                <main style={styles.main}>
                    <p style={styles.cargando}>Cargando...</p>
                </main>
                <PieDePagina />
            </>
        );
    }

    if (!seccion) {
        return (
            <>
                <Encabezado />
                <main style={styles.main}>
                    <p style={styles.noEncontrado}>Sección no encontrada.</p>

                    <button
                        style={styles.volver}
                        onClick={() => navigate("/secciones")}
                    >
                        ← Volver a programas
                    </button>
                </main>
                <PieDePagina />
            </>
        );
    }

    return (
        <>
            <Encabezado />
            <HeaderProgramas titulo={seccion.titulo} />

            <main style={styles.main}>
                {imagenes.length > 0 ? (
                    <div style={styles.grid}>
                        {imagenes.map((imagen, i) => (
                            <TarjetaImagen
                                key={imagen.id ?? i}
                                imagen={imagen}
                                titulo={seccion.titulo}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={styles.sinImagenes}>
                        <p>
                            Lo sentimos. Aún no hay imágenes disponibles para esta sección.
                        </p>

                        <button
                            style={styles.volver}
                            onClick={() => navigate("/secciones")}
                        >
                            ← Volver a programas
                        </button>
                    </div>
                )}
            </main>

            <PieDePagina />
        </>
    );
}

const styles = {
    cargando: {
        textAlign: 'center',
        fontSize: 18,
        color: '#ac9cab',
        marginTop: '3rem',
    },
    main: {
        minHeight: '50vh',
        padding: '0 3rem 3rem',
    },
    grid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        justifyContent: 'center',

    },
    sinImagenes: {
        textAlign: 'center',
        padding: '3rem',
        color: '#4A0042',
        fontSize: 18,
    },
    noEncontrado: {
        textAlign: 'center',
        fontSize: 22,
        color: '#4A0042',
        marginTop: '3rem',
    },
    volver: {
        display: 'block',
        margin: '1rem auto',
        padding: '0.5rem 1.5rem',
        background: '#4A0042',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 16,
    },
};