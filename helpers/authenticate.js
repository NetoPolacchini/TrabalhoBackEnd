const jwt = require('jsonwebtoken');
const UserModel = require('../model/User');



module.exports = {
    token: function (req, res, next){
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ mensagem: 'Token não fornecido' });
        }else{
            if (token.startsWith('Bearer ')) {
                token = token.substring(7);
            }
        }

        jwt.verify(token, 'neto', (err, decoded) => {
            if (err) {
                console.log(err)
                return res.status(401).json({ mensagem: 'Token inválido' });
            }
            try{
                const user = UserModel.findById(decoded.id)
                if(!user){
                    return res.status(401).json({ mensagem: 'Usuário não encontrado' });
                }
                req.user = decoded
                next();
            } catch (err){
                return res.status(500).json({ mensagem: 'Erro ao verificar usuário' });
            }
        });
    },

    isAdmin: function (req, res, next){
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ mensagem: 'Token não fornecido' });
        }else{
            if (token.startsWith('Bearer ')) {
                token = token.substring(7);
            }
        }

        jwt.verify(token, 'neto', async (err, decoded) => {
            if (err) {
                return res.status(401).json({ mensagem: 'Token inválido' });
            }
            try{
                const user = await UserModel.findById(decoded.id)
                if(!user){
                    return res.status(401).json({ mensagem: 'Usuário não encontrado' });
                }

                if(user.isAdmin){
                    req.user = decoded
                    next()
                }else{
                    return res.status(401).json({ mensagem: 'Usuário não tem permissão' });
                }
            } catch (err){
                return res.status(500).json({ mensagem: 'Erro ao verificar usuário' });
            }
        });
    },

    validData: function (date){
        const dateFormatRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

        if (!dateFormatRegex.test(date)) {
            throw new Error('O formato da data tem que ser DD-MM-YYYY');
        }

        const [day, month, year] = date.split('-');

        const dateObject = new Date(`${year}-${month}-${day}`);

        const currentDate = new Date();

        const teste = !isNaN(dateObject.getTime()) && dateObject >= currentDate;

        if(teste){
            return dateObject
        }else{
            throw new Error('A data não pode estar no passado');
        }
    }

}
