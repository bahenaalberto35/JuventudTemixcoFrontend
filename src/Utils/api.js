const BASE_URL = 'https://api.juventudxtemixco.org';


const getHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = {
        'Content-Type': 'application/json'
    };


    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// obtener
export const obtenerDatos = async (endpoint) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error al obtener datos de ${endpoint} (Status: ${response.status})`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en GET:', error);
        throw error;
    }
};

// enviar
export const enviarDatos = async (endpoint, data) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error al enviar datos a ${endpoint} (Status: ${response.status})`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en POST:', error);
        throw error;
    }
};

//actualizar
export const actualizarDatos = async (endpoint, data) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(), 
            body: JSON.stringify(data),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error al actualizar datos en ${endpoint} (Status: ${response.status})`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en PUT:', error);
        throw error;
    }
};

// eliminar
export const eliminarDatos = async (endpoint) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            if (!response.ok) {
                const mensaje = await response.text();
                throw new Error(mensaje);
            }
        }

        return true;

    } catch (error) {
        console.error('Error en DELETE:', error);
        throw error;
    }
};


    export const obtenerArchivo = async (endpoint) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                ...getHeaders(), 
                'Accept': 'application/pdf' 
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error al descargar archivo desde ${endpoint} (Status: ${response.status})`);
        }

       
        return await response.blob();
    } catch (error) {
        console.error('Error al descargar archivo:', error);
        throw error;
    }
};

