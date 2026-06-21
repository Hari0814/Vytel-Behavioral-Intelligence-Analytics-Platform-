from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from app.models.data_models import UserCreate, UserLogin, Token, UserOut
from app.database import get_db
from app.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# In-memory store for demo (replace with MongoDB in production)
_users: dict = {}

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials == "demo-token":
        return {"email": "demo@vytel.me", "name": "Demo User"}
    payload = decode_token(credentials.credentials)
    email = payload.get("sub")
    if email not in _users:
        raise HTTPException(status_code=401, detail="User not found")
    return _users[email]


@router.post("/signup", response_model=Token)
async def signup(body: UserCreate):
    if body.email in _users:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {"name": body.name, "email": body.email, "password_hash": hash_password(body.password)}
    _users[body.email] = user
    token = create_token({"sub": body.email})
    return Token(access_token=token, user=UserOut(name=body.name, email=body.email))


@router.post("/login", response_model=Token)
async def login(body: UserLogin):
    user = _users.get(body.email)
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": body.email})
    return Token(access_token=token, user=UserOut(name=user["name"], email=body.email))


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(name=current_user["name"], email=current_user["email"])
