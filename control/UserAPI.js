const express = require('express');
const router = express.Router();
const {sucess, fail} = require("../helpers/resposta");
const UserDAO = require('../model/User');
const HallDAO = require('../model/Hall')
const BuffetDAO = require('../model/Buffet')
const vToken = require('../helpers/authenticate');
const {eventos} = require("../model/User");


//Register User
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

//Login
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
    } catch (err){
        res.json(err.message);
    }
})

//Create another ADM
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

//List Non admin users
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

//Delete Specific User
router.delete('/admin/listNonAdmin/delete/:id',vToken.isAdmin, async(req, res) => {
    try{
        const user = await UserDAO.delete(req.params.id)
        res.json(sucess(user, 'Usuário Deletado'))
    } catch (err){
        res.json(err.message)
    }
});

//Update Some User by ADM
router.put('/admin/listNonAdmin/update/:id',vToken.isAdmin, async(req, res) => {

    const newData = req.body;
    const userID = req.params.id

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

//Update User
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

//Return All Hall`s and Buffet`s available
router.get("/disponiveis",vToken.token, async (req, res)=> {
    const limite = parseInt(req.query.limite) || 5;
    const pagina = parseInt(req.query.pagina) || 1;
    const limite2 = parseInt(req.query.limite) || 5;
    const pagina2 = parseInt(req.query.pagina) || 1;
    const data = req.query.data;

    try{
        const dataFormatado = vToken.validData(data)
        const halls = await HallDAO.listDisponiveis(limite, pagina, dataFormatado);
        const buffets = await BuffetDAO.list(limite2, pagina2)

        const responseData = {
            halls:halls,
            buffets:buffets
        }
        res.json(sucess(responseData, 'Lista de Salões e buffets disponíveis '))
    } catch(err){
        res.json(err.message)
    }
})

//Choose buffet and hall
router.put("/disponiveis",vToken.token, async (req, res)=> {

    const userId = req.user.id;
    const{idSalao,idBuffet} = req.body
    const data = req.query.data;

    try{
        const dataFormatado = vToken.validData(data)
        const salao = await HallDAO.getById(idSalao);
        const buffet = await BuffetDAO.getById(idBuffet);

        if (!salao || !buffet) {
            return res.status(404).json(fail('Salão ou buffet não encontrado. Insira ID`s válidos'));
        }

        let hall = await HallDAO.getByIdAndDate(idSalao, dataFormatado)
        if(hall){
            const user = await UserDAO.alugarSalaoBuffet(userId, idSalao, idBuffet, dataFormatado);
            res.json(sucess(user, 'Salão e buffet alugados com sucesso'));
        }

    } catch (err){
        res.json(err.message)
    }
})

module.exports = router;
