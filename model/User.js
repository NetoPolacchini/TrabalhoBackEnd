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
    senha: String,
    isAdmin: {
        type:Boolean,
        default:false
    }
})

const UserModel = mongoose.model('User', UserSchema)

module.exports = {

    authenticate: async function (email, senha) {

        try {
            const user = await UserModel.findOne({email});
            if (!user) {
                console.log('Email não cadastrado');
                return false;
            }

            const isPasswordValid = await bcrypt.compare(senha, user.senha);
            if (isPasswordValid) {
                console.log('Usuario autenticado com sucesso', user.email);

                const payload = {
                    id: user._id,
                    nome: user.nome,
                    email: user.email
                };
                console.log(payload)

                return jwt.sign(payload, 'neto', {expiresIn: '1h'})

            } else {
                console.log('senha incorreta')
                return false
            }
        } catch (err) {
            console.log('Erro ao autenticar usuário:', err);
            throw err
        }

    },

    delete: async function (id) {
        const user = await UserModel.findById(id)

        if (!user) {
            throw new Error("Usuário não encontrado")
        }

        if (user.isAdmin) {
            throw new Error("Admin não pode ser deletado!");
        } else {
            return UserModel.findByIdAndDelete(id);
        }
    },

    findById: async function (id) {
        try {
            return await UserModel.findById(id).lean();
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            throw error;
        }
    },


    listNonAdminUsers: async function () {
        try {
            users = UserModel.find({isAdmin: false}).lean();
            return users
        } catch (err) {
            console.log(err)
        }
    },

    save: async function (nome, email, senha, isAdmin) {

        const existingUser = await UserModel.findOne({email});

        if (existingUser) {
            throw new Error("E-mail já registrado");
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(senha, salt);

        const user = new UserModel({
            nome: nome,
            email: email,
            senha: hashedPassword,
            isAdmin: isAdmin
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

    update: async function (id, obj) {

        try {
            let user = await UserModel.findById(id);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            obj.senha = await bcrypt.hash(obj.senha, salt)

            Object.assign(user, obj);
            await user.save();
            return user;
        } catch (err) {
            console.error('Erro durante a atualização', err)
            throw err;
        }
    }
}
