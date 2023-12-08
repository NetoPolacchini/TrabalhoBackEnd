const UserDAO = require("../model/User");
const {sucess, fail} = require("../helpers/resposta");
const express = require("express");
const vToken = require("../helpers/authenticate");
const router = express.Router();
const HallDAO = require('../model/Hall')
const BuffetDAO = require('../model/Buffet')

router.get('/', async(req, res)=>{
    try {

        const predefinedUsers = [
            { nome: 'Admin', email: 'admin@gmail.com', senha: 'senha123', isAdmin: true },
            { nome: 'Usuário1', email: 'usuario1@gmail.com', senha: 'senha123', isAdmin: false },
            { nome: 'Usuário2', email: 'usuario2@gmail.com', senha: 'senha123', isAdmin: false },
            { nome: 'Usuário3', email: 'usuario3@gmail.com', senha: 'senha123', isAdmin: false },
            { nome: 'Usuário4', email: 'usuario4@gmail.com', senha: 'senha123', isAdmin: false }
        ];

        for (const user of predefinedUsers) {
            await UserDAO.save(user.nome, user.email, user.senha, user.isAdmin);
        }


        const predefinedHalls = [
            {nome:"Hall1", endereco:{rua:"Rau1", numero:"1000", bairro:"bairro1", cidade:"cidade1", cep:"cep1"},capacidadeMaxima:120, preco: 890},
            {nome:"Hall2", endereco:{rua:"Rau2", numero:"1002", bairro:"bairro2", cidade:"cidade2", cep:"cep2"},capacidadeMaxima:50, preco: 650},
            {nome:"Hall3", endereco:{rua:"Rau3", numero:"1003", bairro:"bairro3", cidade:"cidade3", cep:"cep3"},capacidadeMaxima:340, preco: 1120},
            {nome:"Hall4", endereco:{rua:"Rau4", numero:"1004", bairro:"bairro4", cidade:"cidade4", cep:"cep4"},capacidadeMaxima:90, preco: 900},
            {nome:"Hall5", endereco:{rua:"Rau5", numero:"1005", bairro:"bairro5", cidade:"cidade5", cep:"cep5"},capacidadeMaxima:76, preco: 450}
        ];

        for (const hall of predefinedHalls) {
            await HallDAO.save(hall.nome, hall.endereco, hall.capacidadeMaxima, hall.preco);
        }

        const predefinedBuffets = [
            {nome:"Buffet1", tipoComida:"Japonesa"},
            {nome:"Buffet2", tipoComida:"Italiana"},
            {nome:"Buffet3", tipoComida:"Lanches"},
            {nome:"Buffet4", tipoComida:"Pastéis"},
            {nome:"Buffet5", tipoComida:"Frutos do Mar"},
        ];

        for (const buffet of predefinedBuffets) {
            await BuffetDAO.save(buffet.nome, buffet.tipoComida);
        }

        res.json(sucess('Contas criadas com sucesso!'));
    } catch (err) {
        res.json(fail(err.message));
    }
})

router.get('/teste/isAdmin', vToken.isAdmin, async(req, res)=>{
    res.json({ mensagem: 'Conseguiu entrar na rota de Admin' });
})

router.get('/teste/restrito', vToken.token, (req, res) => {
    res.json({ mensagem: 'Rota protegida Acessada' });
});

router.get('/teste/listNonAdmin',vToken.isAdmin, async(req, res) => {
    const users = await UserDAO.listNonAdminUsers()
    res.json({ users });
});

router.delete('/teste/listNonAdmin/:id', async(req, res) => {
    try{
        const user = await UserDAO.delete(req.params.id)
        res.json(sucess(user, 'Usuário Deletado'))
    } catch (err){
        res.json(err.message)
    }
});

router.put('/teste/updateUser', async(req, res) => {
    const userID = req.user.id
    const userEmail = req.user.email
    const newData = req.body;

    try{
        const updateUser = await UserDAO.update(userID,userEmail, newData)

        if(updateUser){
            res.json(sucess(updateUser, 'Os dados do usuário foram atualizados'))
        }else{
            res.status(500).json(fail("Falha ao atualizar dados do Usuário"));
        }
    } catch (err){
        res.json(err.message)
    }
});

module.exports = router;
