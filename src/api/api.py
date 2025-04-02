from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.openapi.utils import get_openapi
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, or_, and_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from typing import Optional, List
import secrets
import uvicorn

# Konfiguration
DATABASE_URL = "sqlite:///./test.db"
ZULAESSIGE_DOMAINE = "product.com"
JWT_SECRET = "geheimes_token"
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 Tage

# SQLAlchemy Setup
Engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=Engine)
Base = declarative_base()

# Passwort Context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="anmelden")

# Datenbank Modelle
class BenutzerDB(Base):
    __tablename__ = "benutzer"
    id = Column(Integer, primary_key=True, index=True)
    benutzername = Column(String(255), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    gehashtes_passwort = Column(String(255))
    ist_aktiv = Column(Boolean, default=True)
    muss_passwort_aendern = Column(Boolean, default=True)
    erstellt_am = Column(DateTime, default=datetime.now(timezone(timedelta(hours=1))))
    servicefaelle = relationship("ServicefallDB", back_populates="benutzer")
    comments = relationship("CommentDB", back_populates="benutzer")

class ServicefallDB(Base):
    __tablename__ = "servicefaelle"
    id = Column(Integer, primary_key=True, index=True)
    titel = Column(String(255), nullable=False)
    beschreibung = Column(String(1000), nullable=False)
    prioritaet = Column(String(50), nullable=False)
    zustand = Column(String(50), nullable=False, default="Offen")
    erstellt_am = Column(DateTime, default=datetime.now(timezone(timedelta(hours=1))))
    benutzer_id = Column(Integer, ForeignKey("benutzer.id"))
    benutzer = relationship("BenutzerDB", back_populates="servicefaelle")
    comments = relationship("CommentDB", back_populates="servicefall")

class CommentDB(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(1000), nullable=False)
    erstellt_am = Column(DateTime, default=datetime.now(timezone(timedelta(hours=1))))
    benutzer_id = Column(Integer, ForeignKey("benutzer.id"))
    servicefall_id = Column(Integer, ForeignKey("servicefaelle.id"))
    benutzer = relationship("BenutzerDB", back_populates="comments")
    servicefall = relationship("ServicefallDB", back_populates="comments")

Base.metadata.create_all(bind=Engine)

# Pydantic Modelle
class ServicefallErstellung(BaseModel):
    titel: str
    beschreibung: str
    prioritaet: str

    class Config:
        schema_extra = {
            "example": {
                "titel": "Titel des Servicefalls",
                "beschreibung": "Beschreibung des Servicefalls",
                "prioritaet": "Niedrig"
            }
        }

class ZustandUpdate(BaseModel):
    zustand: str

class CommentCreation(BaseModel):
    text: str

class CommentResponse(BaseModel):
    id: int
    text: str
    erstellt_am: datetime
    benutzer_id: int
    servicefall_id: int

    class Config:
        orm_mode = True

class ServicefallResponse(BaseModel):
    id: int
    titel: str
    beschreibung: str
    prioritaet: str
    zustand: str
    erstellt_am: datetime
    benutzer_id: int
    comments: list[CommentResponse] = []

    class Config:
        orm_mode = True

class BenutzerErstellung(BaseModel):
    benutzername: str
    email: str

class PasswortAenderung(BaseModel):
    altes_passwort: str
    neues_passwort: str

class TokenData(BaseModel):
    benutzername: str

class BenutzerResponse(BaseModel):
    benutzername: str
    email: str
    muss_passwort_aendern: bool
    erstellt_am: datetime


class AnmeldeDaten(BaseModel):
    username: str
    password: str


# Hilfsfunktionen
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def erstelle_passwort_hash(passwort: str):
    return pwd_context.hash(passwort)

def ueberpruefe_passwort(rohes_passwort: str, gehashtes_passwort: str):
    return pwd_context.verify(rohes_passwort, gehashtes_passwort)

def erstelle_jwt_token(data: dict):
    zu_verschluesseln = data.copy()
    expire = datetime.now(timezone(timedelta(hours=1))) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    zu_verschluesseln.update({"exp": expire});
    return jwt.encode(zu_verschluesseln, JWT_SECRET, algorithm=ALGORITHM)

def ueberpruefe_email_domaine(email: str):
    domain = email.split("@")[-1]
    return domain == ZULAESSIGE_DOMAINE

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Ungültige Anmeldedaten",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        benutzername: str = payload.get("sub")
        if benutzername is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    benutzer = db.query(BenutzerDB).filter(
        BenutzerDB.benutzername == benutzername
    ).first()
    if benutzer is None:
        raise credentials_exception
    return benutzer

# API Endpunkte
app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/anmelden")
async def anmelden(
    anmelde_daten: AnmeldeDaten,  # Use the Pydantic model for JSON input
    db: Session = Depends(get_db)
):
    benutzer = db.query(BenutzerDB).filter(
        BenutzerDB.benutzername == anmelde_daten.username
    ).first()
    if not benutzer or not ueberpruefe_passwort(anmelde_daten.password, benutzer.gehashtes_passwort):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiger Benutzername oder Passwort"
        )
    if not benutzer.ist_aktiv:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Benutzerkonto ist deaktiviert"
        )
    access_token = erstelle_jwt_token({"sub": benutzer.benutzername})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/registrierung")
async def registrieren(
    benutzer: BenutzerErstellung,
    db: Session = Depends(get_db)
):
    # Überprüfe E-Mail-Domäne
    if not ueberpruefe_email_domaine(benutzer.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ungültige E-Mail-Domäne"
        )
    # Überprüfe existierenden Benutzer
    db_benutzer = db.query(BenutzerDB).filter(
        (BenutzerDB.benutzername == benutzer.benutzername) |
        (BenutzerDB.email == benutzer.email)
    ).first()
    if db_benutzer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Benutzername oder E-Mail bereits vergeben"
        )
    # Generiere initiales Passwort
    initiales_passwort = secrets.token_urlsafe(12)
    passwort_hash = erstelle_passwort_hash(initiales_passwort)
    # Erstelle Benutzer
    neuer_benutzer = BenutzerDB(
        benutzername=benutzer.benutzername,
        email=benutzer.email,
        gehashtes_passwort=passwort_hash,
        muss_passwort_aendern=True
    )
    db.add(neuer_benutzer)
    db.commit()
    db.refresh(neuer_benutzer)
    # TODO: Willkommens-E-Mail mit initialem Passwort senden
    print(f"Initiales Passwort für {benutzer.email}: {initiales_passwort}")
    return {"message": "Registrierung erfolgreich"}

@app.post("/passwort_aendern")
async def passwort_aendern(
    aenderung: PasswortAenderung,
    current_user: BenutzerDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Überprüfe aktuelles Passwort
    if not ueberpruefe_passwort(aenderung.altes_passwort, current_user.gehashtes_passwort):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiges aktuelles Passwort"
        )
    # Aktualisiere Passwort
    neues_hash = erstelle_passwort_hash(aenderung.neues_passwort)
    current_user.gehashtes_passwort = neues_hash
    current_user.muss_passwort_aendern = False
    db.commit()
    return {"message": "Passwort erfolgreich geändert"}

@app.post("/abmelden")
async def abmelden():
    # In realer Implementierung könnte man den Token hier invalideren
    return {"message": "Erfolgreich abgemeldet"}

@app.get("/benutzer/aktuell", response_model=BenutzerResponse)
async def get_current_user_details(
    current_user: BenutzerDB = Depends(get_current_user)
):
    return {
        "benutzername": current_user.benutzername,
        "email": current_user.email,
        "muss_passwort_aendern": current_user.muss_passwort_aendern,
        "erstellt_am": current_user.erstellt_am
    }

@app.post("/servicefall/erstellen")
async def servicefall_erstellen(
    servicefall: ServicefallErstellung,
    current_user: BenutzerDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if servicefall.prioritaet not in ["Niedrig", "Mittel", "Hoch"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Ungültige Priorität. Erlaubte Werte: Niedrig, Mittel, Hoch"
        )
    neuer_servicefall = ServicefallDB(
        titel=servicefall.titel,
        beschreibung=servicefall.beschreibung,
        prioritaet=servicefall.prioritaet,
        benutzer_id=current_user.id
    )
    db.add(neuer_servicefall)
    db.commit()
    db.refresh(neuer_servicefall)
    return {"message": "Servicefall erfolgreich erstellt"}

@app.get("/servicefall/meine", response_model=list[ServicefallResponse])
async def get_meine_servicefaelle(
    current_user: BenutzerDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    servicefaelle = db.query(ServicefallDB).filter(
        ServicefallDB.benutzer_id == current_user.id
    ).all()
    return servicefaelle

@app.get("/servicefall/alle", response_model=list[ServicefallResponse])
async def get_alle_servicefaelle(
    db: Session = Depends(get_db)
):
    servicefaelle = db.query(ServicefallDB).all()
    return servicefaelle

@app.get("/servicefall/suche", response_model=list[ServicefallResponse])
async def suche_servicefaelle(
    q: Optional[str] = None,
    status: Optional[List[str]] = Query(None),
    priority: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
    current_user: BenutzerDB = Depends(get_current_user)
):
    query = db.query(ServicefallDB)
    conditions = []
    
    if q:
        search = f"%{q}%"
        conditions.append(or_(
            ServicefallDB.titel.ilike(search),
            ServicefallDB.beschreibung.ilike(search)
        ))
    
    if status:
        conditions.append(ServicefallDB.zustand.in_(status))
    
    if priority:
        conditions.append(ServicefallDB.prioritaet.in_(priority))
    
    if conditions:
        query = query.filter(and_(*conditions))
    
    servicefaelle = query.all()
    return servicefaelle

@app.get("/servicefall/{servicefall_id}", response_model=ServicefallResponse)
async def get_servicefall(
    servicefall_id: int,
    db: Session = Depends(get_db),
    current_user: BenutzerDB = Depends(get_current_user)
):
    servicefall = db.query(ServicefallDB).filter(ServicefallDB.id == servicefall_id).first()
    if not servicefall:
        raise HTTPException(status_code=404, detail="Servicefall nicht gefunden")
    return servicefall

@app.put("/servicefall/{servicefall_id}/zustand")
async def update_servicefall_zustand(
    servicefall_id: int,
    zustand_update: ZustandUpdate,
    db: Session = Depends(get_db),
    current_user: BenutzerDB = Depends(get_current_user)
):
    servicefall = db.query(ServicefallDB).filter(ServicefallDB.id == servicefall_id).first()
    if not servicefall:
        raise HTTPException(status_code=404, detail="Servicefall nicht gefunden")
    if servicefall.benutzer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Nicht berechtigt")
    allowed_states = ["Offen", "In Bearbeitung", "Test", "Geschlossen"]
    if zustand_update.zustand not in allowed_states:
        raise HTTPException(status_code=400, detail="Ungültiger Zustand")
    servicefall.zustand = zustand_update.zustand
    db.commit()
    db.refresh(servicefall)
    return servicefall

@app.post("/servicefall/{servicefall_id}/comments")
async def add_comment(
    servicefall_id: int,
    comment: CommentCreation,
    db: Session = Depends(get_db),
    current_user: BenutzerDB = Depends(get_current_user)
):
    servicefall = db.query(ServicefallDB).filter(ServicefallDB.id == servicefall_id).first()
    if not servicefall:
        raise HTTPException(status_code=404, detail="Servicefall nicht gefunden")
    neuer_comment = CommentDB(
        text=comment.text,
        benutzer_id=current_user.id,
        servicefall_id=servicefall_id
    )
    db.add(neuer_comment)
    db.commit()
    db.refresh(neuer_comment)
    return {"message": "Kommentar erfolgreich hinzugefügt"}

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8080, reload=False)