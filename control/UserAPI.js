const express = require('express');
const router = express.Router();
const {sucess, fail} = require("../helpers/resposta");
const UserDAO = require('../model/User');
const HallDAO = require('../model/Hall')
const BuffetDAO = require('../model/Buffet')
const vToken = require('../helpers/authenticate');
const {eventos} = require("../model/User");



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
        const token = await UserDAO.authenticate(emailFornecido, senhaFornecida);
        if(token){
            res.header('authorization', token);

            res.json(sucess(token, 'Usuário Autenticado com sucesso'));

        }else{
            res.json(fail('Erro ao autenticar'));
        }
    } catch (erro){
        res.json(fail('Falha ao autenticar usuário'));
        console.log('Erro:', erro)
    }
})

router.post('/admin/create', vToken.isAdmin, async (req, res) => {
    const {nome, email, senha} = req.body;

    try{
        const user = await UserDAO.save(nome, email, senha, true);
        res.json(sucess(user));
    } catch (err) {
        if (err.message === "E-mail já registrado") {
            res.status(400).json(fail("E-mail já registrado"));
        }else {
            console.error("Erro:", err);
            res.status(500).json(fail("Falha ao salvar o novo Usuário"));
        }
    }
});

router.get('/admin/listNonAdmin',vToken.isAdmin, async(req, res) => {
    const limite = parseInt(req.query.limite) || 5;
    const pagina = parseInt(req.query.pagina) || 1;

    try{
        const users = await UserDAO.listNonAdminUsers(limite, pagina)
        res.json(sucess(users, "list"));
    } catch (err){
        res.status(500).json(err.message);
    }
});

router.delete('/admin/listNonAdmin/delete/:id',vToken.isAdmin, async(req, res) => {
    try{
        const user = await UserDAO.delete(req.params.id)
        res.json(sucess(user, 'Usuário Deletado'))
    } catch (err){
        res.json(err.message)
    }
});

router.put('/updateUser', vToken.token, async(req, res) => {


    const newData = req.body;
    const userID = req.user.id

    try{
        const updateUser = await UserDAO.update(userID, newData)

        if(updateUser){
            res.json(sucess(updateUser, 'Os dados do usuário foram atualizados'))
        }else{
            res.status(500).json(fail("Falha ao atualizar dados do Usuário"));
        }
    } catch (err){
        res.json(err.message)
    }
});

router.post('/evento', vToken.token, async (req, res)=>{
    const userID = req.user.id;
    const { idSalao, idBuffet } = req.body;

    try{
        const salaoValido = await HallDAO.getById(idSalao);
        const buffetValido = await BuffetDAO.getById(idBuffet);

        if(!salaoValido){
            return res.status(400).json(fail('ID de salão inválido.'));
        }

        if(!buffetValido){
            return res.status(400).json(fail('ID de Buffet inválido.'));
        }

        await eventos(userID, idSalao, idBuffet)

        res.json(sucess('Evento atualizado com sucesso.'));

    }catch (err){
        res.json( err.message );
    }
})

router.get('/restrito', vToken.token, (req, res) => {
    res.json({ mensagem: 'Rota protegida Acessada com sucesso!' });
});
module.exports = router;
