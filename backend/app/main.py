from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import engine, Base
from app.models import user, product, sale
from app.routers import auth, products, sales          # 👈 Actualiza esta línea

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="API para dashboard de ventas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)                    # 👈 Agrega esta línea
app.include_router(sales.router)                       # 👈 Agrega esta línea

@app.get("/")
def root():
    return {"message": f"🚀 {settings.APP_NAME} API funcionando"}

@app.get("/health")
def health_check():
    return {"status": "ok"}