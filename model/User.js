const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema( {
    nome: String,
    email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor, insira um email válido']
    },
    senha: String
})

const UserModel = mongoose.model('User', UserSchema)

function gerarTokenJWT(user){
    const payload = {
        nome: user.nome,
        email: user.email,
        id: user._id
    };

    return jwt.sign(payload, 'neto', {expiresIn: 3600})
}

module.exports = {


    findById: async function (id) {
        try {
            console.log('Buscando usuário por ID:', id);
            const user = await UserModel.findById(id).lean();
            console.log('Usuário encontrado:', user);
            return user;
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            throw error;
        }
    },

    save: async function(nome, email, senha){

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            console.log('E-mail já registrado:', existingUser);
            throw new Error("E-mail já registrado");
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(senha, salt);

        const user = new UserModel({
            nome: nome,
            email: email,
            senha: hashedPassword
        })

        try {
            await user.save();
            console.log('Usuário salvo com sucesso:', user.email);
            return user;
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            throw error;
        }
    },

    authenticate: async function (email, senha){

        try{
            const user = await UserModel.findOne({email});
            if (!user) {
                console.log('Email não cadastrado');
                return false;
            }

            const isPasswordValid = await bcrypt.compare(senha, user.senha);
            if(isPasswordValid){
                console.log('Usuario autenticado com sucesso', user.email);

                const payload={
                    id:user._id,
                    nome: user.nome,
                    email: user.email
                };
                console.log(payload)

                const token = jwt.sign(payload, 'neto', { expiresIn: '1h' });

                return token

            }else{
                console.log('senha incorreta')
                return false
            }
        } catch (err) {
            console.log('Erro ao autenticar usuário:', err);
            throw err
        }

    }
}
