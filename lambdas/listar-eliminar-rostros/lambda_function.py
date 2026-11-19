import json
import os

import boto3

rekognition = boto3.client("rekognition")
COLLECTION_ID = os.environ.get("COLLECTION_ID", "rostros-udv")


def responder(status, cuerpo):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json; charset=utf-8"},
        "body": json.dumps(cuerpo, ensure_ascii=False),
    }


def listar_rostros():
    paginador = rekognition.get_paginator("list_faces")
    return [
        {"id": rostro.get("ExternalImageId"), "faceId": rostro["FaceId"]}
        for rostro in paginador.paginate(CollectionId=COLLECTION_ID).search("Faces[]")
    ]


def lambda_handler(event, context):
    metodo = event.get("requestContext", {}).get("http", {}).get("method", "GET")

    if metodo == "GET":
        rostros = listar_rostros()
        return responder(200, {"total": len(rostros), "rostros": rostros})

    if metodo == "DELETE":
        persona_id = (event.get("pathParameters") or {}).get("id", "").strip()
        if not persona_id:
            return responder(400, {"error": "Falta el id de la persona en la URL"})

        face_ids = [rostro["faceId"] for rostro in listar_rostros() if rostro["id"] == persona_id]
        if not face_ids:
            return responder(404, {"error": "No hay rostros registrados con ese id"})

        rekognition.delete_faces(CollectionId=COLLECTION_ID, FaceIds=face_ids)
        return responder(200, {"eliminado": True, "id": persona_id, "rostrosEliminados": len(face_ids)})

    return responder(405, {"error": "Método no permitido"})
