from fastapi import APIRouter, UploadFile, File, Form
from typing import List
from ..services.index import index_documents

router = APIRouter(prefix="", tags=["upload"])

@router.post("/upload")
async def upload(
    department: str = Form(...),
    files: List[UploadFile] = File(...),
):
    contents: list[tuple[str, bytes]] = []
    for f in files:
        data = await f.read()
        contents.append((f.filename, data))
    count = await index_documents(department, contents)
    return {"indexed": count}
