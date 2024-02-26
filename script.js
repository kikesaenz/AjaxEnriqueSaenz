var mymap;
var myChart; // Variable global para almacenar la instancia de la gráfica

function initMap() {
    mymap = L.map('mapid').setView([41.6488, -0.8891], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);
}

function resizeMap() {
    var mapHeight = window.innerHeight - document.querySelector('header').offsetHeight - document.querySelector('.container').offsetHeight - document.querySelector('footer').offsetHeight - 60; // 60 is the total margin-bottom of header and container
    document.getElementById('mapid').style.height = mapHeight + 'px';
}

window.onload = function() {
    initMap();
    resizeMap();
};

window.onresize = function() {
    resizeMap();
};

function ajax(callback) {
    const http = new XMLHttpRequest();
    const url = 'https://www.zaragoza.es/sede/servicio/urbanismo-infraestructuras/estacion-bicicleta.json';

    http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const responseObj = JSON.parse(this.responseText);
            callback(responseObj.result);
        }
    }
    http.open("GET", url);
    http.send();
}

function actualizarMapa(datos) {
    const tipoFiltro = document.getElementById('filtroTipo').value;

    // Limpiar el mapa antes de agregar nuevos elementos
    mymap.eachLayer(function(layer) {
        if (layer instanceof L.Circle) {
            mymap.removeLayer(layer);
        }
    });

    // Dibujar polígonos alrededor de todas las estaciones de bicicletas
    datos.forEach(obj => {
        const coordinates = obj.geometry.coordinates;
        if ((tipoFiltro === "disponibles" && obj.bicisDisponibles > 0) || (tipoFiltro === "noDisponibles" && obj.bicisDisponibles === 0)) {
            const color = tipoFiltro === "disponibles" ? 'blue' : 'red';
            L.circle([coordinates[1], coordinates[0]], {
                color: color,
                fillColor: color,
                fillOpacity: 0.5,
                radius: 100
            }).addTo(mymap).bindPopup(`<b>${obj.title}</b><br>${obj.address}`);
        }
    });
}

function mostrarDatos(datos) {
    const tipoFiltro = document.getElementById('filtroTipo').value;
    const direccionSeleccionada = document.getElementById('filtroDireccion').value;

    let bicisFiltradas;
    if (direccionSeleccionada === 'todos') {
        bicisFiltradas = datos.filter(obj => tipoFiltro === "disponibles" ? obj.bicisDisponibles > 0 : obj.bicisDisponibles === 0);
    } else {
        bicisFiltradas = datos.filter(obj => obj.address === direccionSeleccionada && (tipoFiltro === "disponibles" ? obj.bicisDisponibles > 0 : obj.bicisDisponibles === 0));
    }

    const responseElement = document.getElementById('response');
    responseElement.innerHTML = '';

    // Crear tabla
    const table = document.createElement('table');
    table.classList.add('table');

    // Crear cabecera de la tabla
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Definir nombres de columnas
    const columnNames = ['Título', 'Dirección', 'Número de bicis disponibles', 'Estado'];

    columnNames.forEach(columnName => {
        const th = document.createElement('th');
        th.textContent = columnName;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Crear cuerpo de la tabla
    const tbody = document.createElement('tbody');

    bicisFiltradas.forEach(obj => {
        const row = document.createElement('tr');
        const values = [obj.title, obj.address, obj.bicisDisponibles, obj.estado];

        values.forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    responseElement.appendChild(table);

    // Actualizar capas del mapa con los datos filtrados
    actualizarMapa(bicisFiltradas);

    // Destruir la instancia de la gráfica si ya existe
    if (myChart) {
        myChart.destroy();
    }

    // Crear datos para la gráfica
    const labels = bicisFiltradas.map(obj => obj.title);
    const data = bicisFiltradas.map(obj => obj.bicisDisponibles);
    const backgroundColor = bicisFiltradas.map(obj => obj.bicisDisponibles > 0 ? 'rgba(54, 162, 235, 0.2)' : 'rgba(255, 99, 132, 0.2)');
    const borderColor = bicisFiltradas.map(obj => obj.bicisDisponibles > 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)');

    // Crear la gráfica de barras
    var ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Estaciones de Bicicletas',
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.getElementById("botonMostrarDatos").addEventListener("click", function() {
    ajax(mostrarDatos);
});

document.getElementById("botonMostrarTodas").addEventListener("click", function() {
    document.getElementById('filtroDireccion').value = 'todos';
    document.getElementById('filtroTipo').value = 'disponibles';
    ajax(mostrarDatos);
});  

function imprimirDatos() {
    // Obtener el contenido HTML de la tabla
    const tabla = document.getElementById('response').innerHTML;
    // Crear un documento nuevo para imprimir
    const ventanaImpresion = window.open('', '_blank');
    // Escribir el contenido de la tabla en el documento nuevo
    ventanaImpresion.document.write('<html><head><title>Datos de estaciones de bicicletas</title></head><body>');
    ventanaImpresion.document.write('<h1>Datos de estaciones de bicicletas</h1>');
    ventanaImpresion.document.write(tabla);
    ventanaImpresion.document.write('</body></html>');
    // Imprimir el documento
    ventanaImpresion.print();
    // Cerrar el documento después de imprimir
    ventanaImpresion.close();
}

document.getElementById("botonImprimir").addEventListener("click", function() {
    imprimirDatos();
});

// Llamar a la función ajax para cargar los datos y agregar direcciones al select
ajax(function(datos) {
    const select = document.getElementById('filtroDireccion');
    const direcciones = datos.map(obj => obj.address);
    const direccionesUnicas = [...new Set(direcciones)];
    const optionTodos = document.createElement('option');
    optionTodos.textContent = 'Todos';
    optionTodos.value = 'todos';
    select.appendChild(optionTodos);
    direccionesUnicas.forEach(direccion => {
        const option = document.createElement('option');
        option.textContent = direccion;
        option.value = direccion;
        select.appendChild(option);
    });

    // Mostrar el footer cuando comience a bajar la página
    window.addEventListener('scroll', function() {
        const footer = document.getElementById('mainFooter');
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            footer.style.display = 'block';
        } else {
            footer.style.display = 'none';
        }
    });







});
