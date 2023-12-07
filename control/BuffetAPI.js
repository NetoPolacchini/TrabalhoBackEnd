const express = require("express")
const router = express.Router()

const {sucess, fail} = require("../helpers/resposta")
const BuffetDAO = require('../model/Buffet')

router.get("/", (req, res) => {
    BuffetDAO.list().then((buffets) => {
        res.json(sucess(buffets, "list"))
    })
})

router.get("/:id", (req, res) => {
    BuffetDAO.getById(req.params.id).then(buffet => {
        res.json(sucess(buffet, 'Buffet Localizado'))
    }).catch(err => {
        console.log(err)
        res.status(500).json(fail("Não foi possível localizar o Buffet"))
    })
})

router.delete("/:id", (req, res) => {
    BuffetDAO.delete(req.params.id).then(buffet => {
        res.json(sucess(buffet, 'Buffet Deletado'))
    }).catch(err => {
        console.log(err)
        res.status(500).json(fail("Não foi possível deletar o Buffet"))
    })
})

router.put("/:id", async (req, res) => {
    const buffetID = req.params.id;
    const newData = req.body;
    try{
        const updateBuffet = await BuffetDAO.update(buffetID, newData);

        if(updateBuffet){
            res.json(sucess(updateBuffet, 'Os dados do Buffet foram atualizados'))
        } else {
            res.status(500).json(fail("Falha ao atualizar dados do novo Buffet"));
        }
    } catch (err){
        console.log('Erro: ',err)
    }
})

router.post("/", async (req, res) => {
    const {nome, tipoComida} = req.body

    try {
        const buffet = await BuffetDAO.save(nome, tipoComida)
        res.json(sucess(buffet));
    } catch (err){
        console.error("Erro:", err);
        res.status(500).json(fail("Falha ao salvar o novo Buffet"));
    }
})

module.exports = router;
