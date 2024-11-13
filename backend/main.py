import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router as handwriting_router
from dotenv import load_dotenv
import os

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

environment = os.getenv("ENVIRONMENT")
if environment == "production":
    allow_origins = os.getenv("PROD_ALLOWED_ORIGINS").split(",")
    allow_methods = os.getenv("PROD_ALLOWED_METHODS").split(",")
    allow_headers = os.getenv("PROD_ALLOWED_HEADERS").split(",")
else:
    allow_origins = os.getenv("DEV_ALLOWED_ORIGINS").split(",")
    allow_methods = os.getenv("DEV_ALLOWED_METHODS").split(",")
    allow_headers = os.getenv("DEV_ALLOWED_HEADERS").split(",")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=allow_origins,
#     allow_credentials=True,
#     allow_methods=allow_methods,
#     allow_headers=allow_headers,
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(handwriting_router, prefix="/handwriting")
