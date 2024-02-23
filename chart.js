function crearTablaYChart(datos) {
    crearTabla(datos);
    crearChart(datos);
}

function crearChart(datos) {
    const labels = datos.map(obj => obj.nombre);
    const valores = datos.map(obj => obj.bicisDisponibles);

    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bicis Disponibles',
                data: valores,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
