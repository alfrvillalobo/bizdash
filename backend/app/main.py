from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.database import engine, Base
from app.models import user, product, sale
from app.routers import auth, products, sales

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="API para dashboard de ventas",
    version="1.0.0"
)

# Ahora los orígenes vienen de la variable de entorno
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0]
    message = first_error["msg"].replace("Value error, ", "")
    return JSONResponse(status_code=422, content={"detail": message})

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(sales.router)

@app.get("/")
def root():
    return {"message": f"🚀 {settings.APP_NAME} API funcionando"}

@app.get("/health")
def health_check():
    return {"status": "ok"}