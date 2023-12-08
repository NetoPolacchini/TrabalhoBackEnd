const express = require("express")
const router = express.Router()

const {sucess, fail} = require("../helpers/resposta")
const HallDAO = require('../model/Hall')

router.get("/", async (req, res) => {
    const limite = parseInt(req.query.limite) || 5;
    const pagina = parseInt(req.query.pagina) || 1;

    try{
        const halls = await HallDAO.list(limite, pagina)
        res.json(sucess(halls, "list"));
    } catch (err){
        res.status(500).json(err.message);
    }
})

router.get("/:id", (req, res) => {
    HallDAO.getById(req.params.id).then(hall => {
        res.json(sucess(hall, 'Salão Localizado'))
    }).catch(err => {
        console.log(err)
        res.status(500).json(fail("Não foi possível localizar o Salão"))
    })
})

router.delete("/:id", (req, res) => {
    HallDAO.delete(req.params.id).then(hall => {
        res.json(sucess(hall, 'Salão Deletado'))
    }).catch(err => {
        console.log(err)
        res.status(500).json(fail("Não foi possível deletar o Salão"))
    })
})

router.put("/:id", async (req, res) => {
    const hallID = req.params.id;
    const newData = req.body;
    try{
        const updateHall = await HallDAO.update(hallID, newData);

        if(updateHall){
            res.json(sucess(updateHall, 'Os dados do salão foram atualizados'))
        } else {
            res.status(500).json(fail("Falha ao atualizar dados do novo Salão"));
        }
    } catch (err){
        console.log('Erro: ',err)
    }
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
