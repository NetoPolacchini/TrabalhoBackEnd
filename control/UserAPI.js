const express = require('express');
const router = express.Router();
const {sucess, fail} = require("../helpers/resposta");
const UserDAO = require('../model/User');
const vToken = require('../helpers/authenticate');
const jwt = require('jsonwebtoken')



router.post('/cadastro', async(req, res)=>{

    const {nome, email, senha} = req.body;

    try{
        const user = await UserDAO.save(nome, email, senha);
        res.json(sucess(user));
    } catch (err) {
        if (err.message === "E-mail já registrado") {
            res.status(400).json(fail("E-mail já registrado"));
        }else {
            console.error("Erro:", err);
            res.status(500).json(fail("Falha ao salvar o novo Usuário"));
        }
    }
})

router.post('/login', async(req, res)=>{
    const {emailFornecido, senhaFornecida} = req.body;

    try{
        token = await UserDAO.authenticate(emailFornecido, senhaFornecida);
        if(token){
            res.header('authorization', `Bearer ${token}`);

            res.json(sucess(token, 'Usuário Autenticado com sucesso'));

        }else{
            res.json(fail('Erro ao autenticar'));
        }
    } catch (erro){
        res.json(fail('Falha ao autenticar usuário'));
        console.log('Erro:', erro)
    }

})

// Exemplo de rota protegida
router.get('/restrito', vToken, (req, res) => {
    res.json({ mensagem: 'Rota protegida Acessada' });
});


module.exports = router;
