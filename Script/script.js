const mongoose = require('mongoose');

// Conectar ao MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/BackEnd");

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('Erro na conexão com o banco de dados:', error);
});

db.once('open', () => {
    console.log('Conexão bem-sucedida com o banco de dados!');
    // Agora você pode executar operações no banco de dados
});

db.on('disconnected', () => {
    console.log('Desconectado do banco de dados');
});

const UserSchema = new mongoose.Schema({
    nome: String,
    email: String,
    senha: String,
});

const UserModel = mongoose.model('User', UserSchema);

// Função para realizar a consulta
async function consultarUsuarioPorEmail(email) {
    try {
        const user = await UserModel.findOne({ email:email });
        console.log('Usuário encontrado:', user);
    } catch (error) {
        console.error('Erro ao consultar usuário:', error);
    } finally {
        mongoose.disconnect(); // Desconectar do MongoDB ao finalizar
    }
}

// Chamar a função com um e-mail específico para teste
consultarUsuarioPorEmail('teste1@gmail.com');
