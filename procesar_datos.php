<?php
// Verificar si se recibieron datos POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtener los datos enviados desde la solicitud AJAX
    $datos = json_decode(file_get_contents("php://input"), true);

    // Aquí puedes procesar los datos y guardarlos en tu base de datos
    // Por ejemplo, podrías conectar a la base de datos y ejecutar una consulta SQL para insertar los datos

    // Aquí simplemente devolvemos una respuesta de éxito para indicar que los datos fueron recibidos correctamente
    echo json_encode(array("status" => "success"));
} else {
    // Si la solicitud no es de tipo POST, devolvemos un error
    http_response_code(405); // Método no permitido
    echo json_encode(array("status" => "error", "message" => "Método no permitido"));
}
?>
