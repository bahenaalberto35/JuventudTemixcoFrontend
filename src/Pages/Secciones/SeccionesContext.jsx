import { createContext, useContext, useState, useEffect } from 'react';
import {alertaError} from "../../Utils/alerts.js";

const BASE_URL = "https://api.juventudxtemixco.org";

const SeccionesContext = createContext(null);

export function SeccionesProvider({ children }) {
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);

                const res = await fetch(`${BASE_URL}/api/section`,{
                    credentials: 'include',
                });

                const data = await res.json();

                const adaptadas = data.map((sec) => ({
                    id: sec.id,
                    slug: sec.name
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, ''),
                    titulo: sec.name,
                    descripcion: sec.description,
                    imagen: `${BASE_URL}/api/section/imagen/${sec.id}`,
                    imagenes: undefined,
                }));

                setSecciones(adaptadas);
            } catch (error) {
                alertaError("Ocurrió un error a cargar la información");
                console.error("Ocurrió un error a cargar las secciones: ", error)
            } finally {
                setLoading(false);
            }
        };

        cargar();

    }, []);

    const cargarImagenesDeSeccion = async (id) => {
        try {
            console.log("Pidiendo imágenes", id);
            setLoading(true);

            const res = await fetch(`${BASE_URL}/api/section/${id}/programs`, {
                credentials: "include",
            });

            console.log("Status:", res.status);

            const programas = await res.json();

            console.log("Programas:", programas);

            const imagenes = programas
                .filter(p => p.image !== null)
                .map(p => ({
                    id: p.id,
                    url: `${BASE_URL}/api/section/program/image/${p.id}`,
                    descripcion: p.name ?? "",
                }));

            console.log("Imágenes:", imagenes);

            setSecciones(prev =>
                prev.map(s =>
                    s.id === id
                        ? { ...s, imagenes }
                        : s
                )
            );

            console.log("setSecciones ejecutado");
        } catch (e) {
            console.error(e);
        } finally {
            console.log("finally");
            setLoading(false);
        }
    };

    const agregarSeccion = (nuevaSeccion) => {
        const slug = nuevaSeccion.titulo
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        setSecciones((prev) => [
            ...prev,
            { ...nuevaSeccion, id: Date.now(), slug, imagenes: nuevaSeccion.imagenes ?? [] },
        ]);
    };

    const agregarImagenes = (slug, nuevasImagenes) => {
        setSecciones((prev) =>
            prev.map((s) =>
                s.slug === slug
                    ? { ...s, imagenes: [...(s.imagenes ?? []), ...nuevasImagenes] }
                    : s
            )
        );
    };

    // Buscar una sección por su slug
    const obtenerPorSlug = (slug) =>
        secciones.find((s) => s.slug === slug) ?? null;

    return (
        <SeccionesContext.Provider value={{ secciones, loading, agregarSeccion, agregarImagenes, obtenerPorSlug, cargarImagenesDeSeccion }}>
            {children}
        </SeccionesContext.Provider>
    );
}

// Hook para consumir el contexto
export function useSecciones() {
    const ctx = useContext(SeccionesContext);
    if (!ctx) throw new Error('useSecciones debe usarse dentro de <SeccionesProvider>');
    return ctx;
}