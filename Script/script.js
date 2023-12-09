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
            { nome: 'João', email: 'joao@gmail.com', senha: 'senha123', isAdmin: false },
            { nome: 'Isabela', email: 'isabela@gmail.com', senha: 'senha123', isAdmin: false },
            { nome: 'Karine', email: 'karine@gmail.com', senha: 'senha123', isAdmin: false },
            { nome: 'Leonardo', email: 'leonardo@gmail.com', senha: 'senha123', isAdmin: false }
        ];

        for (const user of predefinedUsers) {
            await UserDAO.save(user.nome, user.email, user.senha, user.isAdmin);
        }


        const predefinedHalls = [
            {nome:"Celebração Palace", endereco:{rua:"Rau1", numero:"1000", bairro:"bairro1", cidade:"cidade1", cep:"cep1"},capacidadeMaxima:120, preco: 890},
            {nome:"Elegância Eventos", endereco:{rua:"Rau2", numero:"1002", bairro:"bairro2", cidade:"cidade2", cep:"cep2"},capacidadeMaxima:50, preco: 650},
            {nome:"Espaço Festivo Glamour", endereco:{rua:"Rau3", numero:"1003", bairro:"bairro3", cidade:"cidade3", cep:"cep3"},capacidadeMaxima:340, preco: 1120},
            {nome:"Salão do Sonho", endereco:{rua:"Rau4", numero:"1004", bairro:"bairro4", cidade:"cidade4", cep:"cep4"},capacidadeMaxima:90, preco: 900},
            {nome:"Jardim das Festas", endereco:{rua:"Rau5", numero:"1005", bairro:"bairro5", cidade:"cidade5", cep:"cep5"},capacidadeMaxima:76, preco: 450}
        ];

        for (const hall of predefinedHalls) {
            await HallDAO.save(hall.nome, hall.endereco, hall.capacidadeMaxima, hall.preco);
        }

        const predefinedBuffets = [
            {nome:"Delícias Gourmet", tipoComida:"Cozinha Internacional"},
            {nome:"Sabor & Arte Buffet", tipoComida:"Comida Contemporânea"},
            {nome:"Festa Italiana Catering", tipoComida:"Italiana"},
            {nome:"Sabores do Oriente Eventos", tipoComida:"Culinária Asiática"},
            {nome:"Churrasco Brasileiro Catering", tipoComida:"Churrasco Brasileiro"},
        ];

        for (const buffet of predefinedBuffets) {
            await BuffetDAO.save(buffet.nome, buffet.tipoComida);
        }

        res.json(sucess('Banco de dados populado com sucesso!'));
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

router.get('/teste/listEvents',vToken.token, async(req, res) => {
    const userId = req.user.id;
    const limite = parseInt(req.query.limite) || 5;
    const pagina = parseInt(req.query.pagina) || 1;

    try{
        const eventos = await UserDAO.listEvents(limite, pagina, userId)
        console.log('Aqui fora sai como:', eventos)
        res.json({ eventos });
    } catch (err){
        res.json(err.message);
    }
});



module.exports = router;
