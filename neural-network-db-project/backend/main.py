from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
import models
import database
import auth
from dependencies import get_current_user, get_current_admin_user, get_current_active_user
from pydantic import BaseModel
from datetime import timedelta
import aiofiles
import os
from PIL import Image
import io
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager

# Pydantic модели
class PageCreate(BaseModel):
    name: str
    title: str

class PageResponse(BaseModel):
    id: int
    name: str
    title: str

class KPIUpdate(BaseModel):
    time_spent: float

class KPIResponse(BaseModel):
    page_id: int
    page_name: str
    page_title: str
    visit_count: int
    total_time_spent: float
    avg_time_spent: float

# Функция для инициализации при запуске
async def startup_event():
    db = database.SessionLocal()
    try:
        models.Base.metadata.create_all(bind=database.engine)
        
        # Создаем роли если их нет
        roles = db.query(models.Role).all()
        if not roles:
            admin_role = models.Role(name="admin")
            user_role = models.Role(name="user")
            db.add(admin_role)
            db.add(user_role)
            db.commit()
            db.refresh(admin_role)
            
            # Создаем admin пользователя если нет
            admin_user = db.query(models.User).filter(models.User.email == "admin@example.com").first()
            if not admin_user:
                admin_user = models.User(
                    email="admin@example.com",
                    hashed_password=auth.get_password_hash("admin123"),
                    role_id=admin_role.id
                )
                db.add(admin_user)
                db.commit()
    except Exception as e:
        print(f"Startup error: {e}")
    finally:
        db.close()

# Lifespan handler вместо on_event
@asynccontextmanager
async def lifespan(app: FastAPI):
    # При запуске
    await startup_event()
    yield
    # При завершении (можно добавить cleanup)

app = FastAPI(title="Neural Networks API with Auth", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Папка для загруженных изображений
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ========== ЭНДПОИНТЫ АВТОРИЗАЦИИ (публичные) ==========

@app.post("/register", response_model=auth.UserResponse)
def register(user: auth.UserCreate, db: Session = Depends(database.get_db)):
    # Проверяем существует ли пользователь
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Находим роль user
    role = db.query(models.Role).filter(models.Role.name == "user").first()
    if not role:
        raise HTTPException(status_code=500, detail="User role not found")
    
    # Создаем пользователя
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        role_id=role.id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return auth.UserResponse(
        id=db_user.id,
        email=db_user.email,
        role=role.name
    )

@app.post("/login")
def login(user: auth.UserLogin, db: Session = Depends(database.get_db)):
    # Находим пользователя
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Создаем токен
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.email, "role": db_user.role.name},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "role": db_user.role.name}

# ========== ЭНДПОИНТЫ ДЛЯ БАЗЫ ДАННЫХ (требуют авторизации) ==========

@app.post("/pages/", response_model=PageResponse)
def create_page(
    page: PageCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_page = db.query(models.Page).filter(models.Page.name == page.name).first()
    if db_page:
        raise HTTPException(status_code=400, detail="Page already exists")
    
    db_page = models.Page(name=page.name, title=page.title)
    db.add(db_page)
    db.commit()
    db.refresh(db_page)
    
    db_kpi = models.KPI(page_id=db_page.id)
    db.add(db_kpi)
    db.commit()
    
    return db_page

@app.get("/pages/{page_id}", response_model=PageResponse)
def get_page(
    page_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    page = db.query(models.Page).filter(models.Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@app.get("/pages/", response_model=List[PageResponse])
def get_all_pages(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    return db.query(models.Page).all()

@app.post("/kpi/{page_id}/visit")
def record_visit(
    page_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    kpi = db.query(models.KPI).filter(models.KPI.page_id == page_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI record not found")
    
    kpi.visit_count += 1
    db.commit()
    return {"message": "Visit recorded", "visit_count": kpi.visit_count}

@app.post("/kpi/{page_id}/time")
def record_time_spent(
    page_id: int, 
    kpi_data: KPIUpdate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    kpi = db.query(models.KPI).filter(models.KPI.page_id == page_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI record not found")
    
    kpi.total_time_spent += kpi_data.time_spent
    db.commit()
    return {"message": "Time recorded", "total_time_spent": kpi.total_time_spent}

@app.get("/kpi/", response_model=List[KPIResponse])
def get_all_kpi(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_admin_user)  # ← ТОЛЬКО ДЛЯ АДМИНОВ
):
    kpis = db.query(models.KPI).join(models.Page).all()
    result = []
    for kpi in kpis:
        result.append(KPIResponse(
            page_id=kpi.page_id,
            page_name=kpi.page.name,
            page_title=kpi.page.title,
            visit_count=kpi.visit_count,
            total_time_spent=kpi.total_time_spent,
            avg_time_spent=kpi.total_time_spent / kpi.visit_count if kpi.visit_count > 0 else 0
        ))
    return result

# ========== ЭНДПОИНТЫ ДЛЯ ПОСТОВ И ИЗОБРАЖЕНИЙ (требуют авторизации) ==========

@app.get("/")
async def root():
    return {"message": "Neural Networks API with Authentication"}

@app.get("/posts")
async def get_posts(current_user: models.User = Depends(get_current_active_user)):
    return [
        {
            "userId": 1,
            "id": 1,
            "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
            "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
        },
        {
            "userId": 1,
            "id": 2, 
            "title": "qui est esse",
            "body": "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla"
        }
    ]

@app.post("/invert-image")
async def invert_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_active_user)
):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        contents = await file.read()
        
        image = Image.open(io.BytesIO(contents))
        
        if image.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1])
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        inverted_image = Image.eval(image, lambda x: 255 - x)
        
        output_path = os.path.join(UPLOAD_DIR, f"inverted_{file.filename}")
        inverted_image.save(output_path, "JPEG")
        
        return FileResponse(
            path=output_path,
            filename=f"inverted_{file.filename}",
            media_type='image/jpeg'
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/openapi.json", include_in_schema=False)
async def get_openapi():
    return JSONResponse(content=app.openapi())

@app.get("/me")
async def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.name,
        "is_active": current_user.is_active
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)