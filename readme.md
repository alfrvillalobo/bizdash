📊 BizDash — Dashboard de Ventas

Aplicación fullstack para gestión de ventas con dashboard en tiempo real, autenticación JWT y sistema de roles.
🌐 Demo: bizdash-psi.vercel.app

Stack
Frontend: Next.js 15, TypeScript, Tailwind CSS, Recharts
Backend: FastAPI, Python, SQLAlchemy, PostgreSQL
Deploy: Vercel (frontend) + Railway (backend + BD)

Características

🔐 Autenticación JWT con roles Admin y Vendedor
📊 Dashboard con gráficos de líneas, torta y barras
📦 CRUD completo de Productos con control de stock
💰 Registro de Ventas con cálculo automático
👥 Gestión de Usuarios (solo Admin)
📱 Diseño responsivo con menú hamburguesa


Instalación local

cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

cd frontend
npm install
npm run dev