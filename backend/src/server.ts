import app from './app';

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_seguro'; 

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});