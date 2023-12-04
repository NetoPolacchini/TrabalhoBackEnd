const mongoose = require("mongoose")
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema( {
    nome: String,
    email: String,
    senha: String
})

const UserModel = mongoose.model('User', UserSchema)

module.exports = {
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
            const user = await UserModel.findOne({ email });
            if (!user) {
                console.log('Email não cadastrado');
                return false;
            }
            const isPasswordValid = await bcrypt.compare(senha, user.senha);
            if(isPasswordValid){
                console.log('Usuario autenticado com sucesso', user.email);
                return user;
            }else{
                console.log('senha incorreta')
                return false
            }
        } catch (err) {
            console.log('Erro ao autenticar usuário:', error);
            throw error
        }

    }
}
