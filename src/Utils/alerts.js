import Swal from "sweetalert2";

/* CONFIGURACIÓN GLOBAL PARA TODAS LAS ALERTAS*/
export const swalBase = Swal.mixin({
    buttonsStyling: false,
    customClass: {
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn"
    }
});


export const alertaCamposCaracteres = (mensaje = "Solo se permiten letras en este campo") => {
    return swalBase.fire({
        icon: "error",
        title: "Error",
        text: mensaje
    });
};

export const alertaCamposVacios = () => {
    return swalBase.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Debes completar todos los campos del formulario"
    });
};

export const alertaExito = (mensaje = "Operación realizada correctamente") => {
    return swalBase.fire({
        icon: "success",
        title: "Éxito",
        text: mensaje
    });
};

export const alertaAgradecimiento = (mensaje = "Tu aportación ayudará a financiar programas y actividades en beneficio de la comunidad.\n") => {
    return swalBase.fire({
        icon: "success",
        title: "¡Gracias por tu donación! \n💜",
        text: mensaje
    })
}

export const alertaError = (mensaje = "Ocurrió un error") => {
    return swalBase.fire({
        icon: "error",
        title: "Error",
        text: mensaje
    });
};

export const alertaSinCambios = () => {
    return swalBase.fire({
        icon: "info",
        title: "Sin cambios",
        text: "No modificaste ningún dato"
    });
};

export const alertaCerrarSesion = () => {
    return swalBase.fire( {
        icon: "question",
        title: "Cerrar Sesión",
        text: "¿Deseas cerrar sesión?",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar"
    })
}

export const confirmarEliminar = async () => {

    const resultado = await swalBase.fire({
        icon: "warning",
        title: "¿Eliminar registro?",
        text: "Esta acción no se puede deshacer",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
    });

    return resultado.isConfirmed;
};

export const alertaMasInformacion = () => {
    return swalBase.fire({
        icon: "info",
        title: "Más información",
        html: `
            <p>
                Tu apoyo directo nos permite impulsar programas sociales.
            </p>
            <br>
            <p>
                Si deseas conocer a detalle el seguimiento y el impacto de tu aportación, 
                déjanos tus datos  en nuestro <a href="https://wa.me/527772578970" target="_blank" style="text-decoration: none; color: #400040; font-weight: bold;">WHATSAPP</a>  o números que aparecen en nuestra 
                pagina y nos pondremos en contacto contigo para atenderte personalmente
            </p>
            <br>
            <strong>Cada peso cuenta.</strong>
        `,
        confirmButtonText: "Cerrar"
    });
};


export const toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});
