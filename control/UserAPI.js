const express = require('express');
const router = express.Router();
const {sucess, fail} = require("../helpers/resposta");
const UserDAO = require('../model/User');


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
        teste = await UserDAO.authenticate(emailFornecido, senhaFornecida);
        res.json(sucess(teste));
    } catch (erro){
        res.json(fail('falhou'));
        console.log('Erro:', erro)
    }

})


module.exports = router;
