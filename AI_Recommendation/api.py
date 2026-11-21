from contextlib import asynccontextmanager
import os
import sys

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from config import DEFAULT_SVD_CONFIG, MODEL_PATH
from recommend import load_saved_model, recommend_top_n

MODEL_STATE = {"bundle": None}


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Chỉ tải model đã huấn luyện sẵn 1 lần khi API khởi động (KHÔNG train lại mỗi request)
    MODEL_STATE["bundle"] = load_saved_model(MODEL_PATH)
    yield
    MODEL_STATE["bundle"] = None


app = FastAPI(
    title="Movix AI Movie Recommendation API",
    description="API gợi ý phim bằng Collaborative Filtering (Surprise SVD) theo kiến trúc Offline Training → Save Model → Online Recommendation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    bundle = MODEL_STATE["bundle"]
    return {
        "status": "ok",
        "model_loaded": bundle is not None,
        "backend": bundle.get("backend") if bundle else None,
        "stats": bundle.get("stats") if bundle else None,
    }


@app.get("/api/recommendations/{user_id}")
def get_user_recommendations(
    user_id: str,
    top_n: int = Query(default=DEFAULT_SVD_CONFIG["top_n"], ge=1, le=20),
):
    return recommend_top_n(
        user_id=user_id,
        top_n=top_n,
        model_bundle=MODEL_STATE["bundle"],
        model_path=MODEL_PATH,
    )


@app.post("/api/reload-model")
def reload_model():
    MODEL_STATE["bundle"] = load_saved_model(MODEL_PATH)
    return {
        "ok": True,
        "model_loaded": MODEL_STATE["bundle"] is not None,
        "stats": MODEL_STATE["bundle"].get("stats") if MODEL_STATE["bundle"] else None,
    }
