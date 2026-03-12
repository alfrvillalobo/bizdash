# 📊 BizDash — Dashboard de Ventas

Aplicación fullstack para gestión de ventas con dashboard en tiempo real, autenticación JWT y sistema de roles.

🌐 **Demo en vivo:** [bizdash-psi.vercel.app](https://bizdash-psi.vercel.app)

---

## 🛠️ Stack

| Capa | Tecnologías |
|---|---|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Recharts |
| **Backend** | FastAPI, Python, SQLAlchemy, PostgreSQL |
| **Deploy** | Vercel (frontend) + Railway (backend + BD) |

---

## ✨ Características

- 🔐 Autenticación JWT con roles **Admin** y **Vendedor**
- 📊 Dashboard con gráficos de líneas, torta y barras
- 📦 CRUD completo de Productos con control de stock
- 💰 Registro de Ventas con cálculo automático
- 👥 Gestión de Usuarios (solo Admin)
- 📱 Diseño responsivo

---

## 🚀 Instalación local

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

> ⚙️ Recuerda configurar los archivos `.env` en backend y `.env.local` en frontend antes de arrancar.

---

## 👨‍💻 Autor

**Alfredo Villalobos** · [GitHub](https://github.com/alfrvillalobo) · ignacioalfredo3105@gmail.com
