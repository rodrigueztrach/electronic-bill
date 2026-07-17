require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const sequelize = require('./config/db');
require('./models'); // registra relaciones

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const productoRoutes = require('./routes/productoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const facturaRoutes = require('./routes/facturaRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/usuarios', usuarioRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    // En desarrollo puedes usar sync(); en producción usa las migraciones SQL.
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
    }
    app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

start();
