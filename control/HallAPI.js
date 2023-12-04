const express = require("express")
const router = express.Router()

const {sucess, fail} = require("../helpers/resposta")
const HallDAO = require('../model/Hall')

router.get("/", (req, res) => {
    HallDAO.list().then((halls) => {
        res.json(sucess(halls, "list"))
    })
})

router.get("/:id", (req, res) => {
    HallDAO.getById(req.params.id).then(hall => {
        res.json(sucess(hall))
    }).catch(err => {
        console.log(err)
        res.status(500).json(fail("Não foi possível localizar o Salão"))
    })
})

router.post("/", async (req, res) => {
    const {nome, endereco, capacidadeMaxima, preco} = req.body

    try {
        const hall = await HallDAO.save(nome, endereco, capacidadeMaxima, preco)
        res.json(sucess(hall));
    } catch (err){
        console.error("Erro:", err);
        res.status(500).json(fail("Falha ao salvar o novo Salão"));
    }
})

module.exports = router;
