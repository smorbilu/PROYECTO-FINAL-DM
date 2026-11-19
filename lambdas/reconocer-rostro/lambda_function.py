import base64
import json
import os

import boto3

rekognition = boto3.client("rekognition")
COLLECTION_ID = os.environ.get("COLLECTION_ID", "rostros-udv")
SIMILITUD_MINIMA = float(os.environ.get("SIMILITUD_MINIMA", "85"))


def responder(status, cuerpo):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json; charset=utf-8"},
        "body": json.dumps(cuerpo, ensure_ascii=False),
    }


def leer_cuerpo(event):
    crudo = event.get("body") or ""
    if event.get("isBase64Encoded"):
        crudo = base64.b64decode(crudo).decode("utf-8")
    datos = json.loads(crudo)
    if not isinstance(datos, dict):
        raise ValueError("El cuerpo no es un objeto JSON")
    return datos


def leer_imagen(texto):
    texto = texto.strip()
    if texto.startswith("data:") and "," in texto:
        texto = texto.split(",", 1)[1]
    return base64.b64decode("".join(texto.split()), validate=True)


def lambda_handler(event, context):
    try:
        datos = leer_cuerpo(event)
    except ValueError:
        return responder(400, {"error": "El cuerpo debe ser un JSON válido"})

    imagen = datos.get("image")
    if not isinstance(imagen, str) or not imagen:
        return responder(400, {"error": "El campo image es obligatorio (foto en base64)"})

    try:
        imagen_bytes = leer_imagen(imagen)
    except ValueError:
        return responder(400, {"error": "El campo image no es un base64 válido"})

    try:
        resultado = rekognition.search_faces_by_image(
            CollectionId=COLLECTION_ID,
            Image={"Bytes": imagen_bytes},
            FaceMatchThreshold=SIMILITUD_MINIMA,
            MaxFaces=1,
        )
    except rekognition.exceptions.InvalidParameterException:
        return responder(400, {"error": "No se detectó un rostro en la imagen"})
    except (
        rekognition.exceptions.InvalidImageFormatException,
        rekognition.exceptions.ImageTooLargeException,
    ):
        return responder(400, {"error": "La imagen no es válida (debe ser JPG o PNG de menos de 5 MB)"})

    coincidencias = resultado["FaceMatches"]
    if not coincidencias:
        return responder(200, {"match": False})

    mejor = coincidencias[0]
    return responder(200, {
        "match": True,
        "id": mejor["Face"]["ExternalImageId"],
        "similarity": mejor["Similarity"],
    })
