const jwt = require('jsonwebtoken');
const UserModel = require('../model/User');


module.exports = (req, res, next) =>{
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ mensagem: 'Token não fornecido' });
    }else{
        console.log('Token Forcenido')
    }

    jwt.verify(token, 'neto', (err, decoded) => {
        if (err) {
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
}
