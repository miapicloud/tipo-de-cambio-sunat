const elementoCalendario = document.getElementById('calendario');
const tituloMes = document.getElementById('titulo-mes');
const TOKEN_BEARER = "";

const hoy = new Date();
let [añoActual, mesActual] = [hoy.getFullYear(), hoy.getMonth() + 1];

let datosPreCargados = {};

const obtenerNombreMes = (mes) => ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][mes - 1];

//console.log(obtenerNombreMes(mesActual));

//renderizamos el calendario

const renderizarCalendario = (datos, mes, año) => {

    tituloMes.innerText = `${obtenerNombreMes(mesActual)} ${añoActual}`;
    const diasEnMes = new Date(año, mes, 0).getDate();
    const primerDia = new Date(año, mes - 1, 1).getDay();
    const dias = Array.from({ length: diasEnMes }, () => []);

    datos.forEach(({ fecPublica, valTipo, codTipo }) => {
        dias[+fecPublica.split('/')[0] - 1].push(`<div class="${codTipo === 'C' ? 'compra' : 'venta'}">${codTipo === 'C' ? 'Compra' : 'Venta'} ${valTipo}</div>`);
    });

    elementoCalendario.innerHTML = [...Array(primerDia).fill('<div class="dia"></div>'),
        ...dias.map((contenido, i) => `<div class="dia"><header>${i + 1}</header>${contenido.join('')}</div>`)].join('');
}

const datosSimulados = [
    { fecPublica: '01/01/2024', valTipo: '10.00', codTipo: 'C' },
    { fecPublica: '02/01/2024', valTipo: '11.00', codTipo: 'V' },
    { fecPublica: '03/01/2024', valTipo: '12.00', codTipo: 'C' },
    { fecPublica: '04/01/2024', valTipo: '13.00', codTipo: 'V' },
    { fecPublica: '05/01/2024', valTipo: '14.00', codTipo: 'C' }
];

//enderizarCalendario(datosSimulados, mesActual, añoActual);
//console.log(datosSimulados);


const obtenerDatos = async (año, mes) => {
    const clave = `${año}-${mes}`;

    try {

        const { data } = await axios.post('https://miapi.cloud/v1/tipodecambio', { anio: año, mes: mes }, { headers: { Authorization: `Bearer ${TOKEN_BEARER}` } });
        if (data.success) datosPreCargados[clave] = data.data;
        console.log(data);
    } catch (error) {
        console.error('Error al obtener los datos del tipo de cambio mensual:', error);
    }
};

//obtenerDatos(añoActual, mesActual);

//precargamos año

const precargarAño = async (año) => {
    const mesesCargar = [];
    for (let m = 1; m <= 12; m++) mesesCargar.push(obtenerDatos(año, m));
    await Promise.all(mesesCargar);
}


const cambiarMes = direccion => {
    mesActual += direccion;

    if (mesActual > 12) mesActual = 1, añoActual++;
    if (mesActual < 1) mesActual = 12, añoActual--;

    const clave = `${añoActual}-${mesActual}`;
    if (datosPreCargados[clave]) {
        renderizarCalendario(datosPreCargados[clave], mesActual, añoActual);
    } else {
        precargarAño(añoActual).then(() => renderizarCalendario(datosPreCargados[clave], mesActual, añoActual));
    }
}

//inicializamos
document.addEventListener('DOMContentLoaded', async () => {
    await precargarAño(añoActual);
    renderizarCalendario(datosPreCargados[`${añoActual}-${mesActual}`], mesActual, añoActual);
});
