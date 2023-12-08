const express = require("express")
const router = express.Router()
const vToken = require('../helpers/authenticate');
const {sucess, fail} = require("../helpers/resposta")
const BuffetDAO = require('../model/Buffet')
const HallDAO = require("../model/Hall");

//Return All Buffet`s
router.get("/", async (req, res) => {
    const limite = parseInt(req.query.limite) || 5;
    const pagina = parseInt(req.query.pagina) || 1;

    try{
        const buffets = await HallDAO.list(limite, pagina)
        res.json(sucess(buffets, "Buffets"));
    } catch (err){
        res.status(500).json(err.message);
    }
})

//Return Specific Buffet
router.get("/:id", (req, res) => {
    BuffetDAO.getById(req.params.id).then(buffet => {
        res.json(sucess(buffet, 'Buffet Localizado'))
    }).catch(err => {
        console.log(err)
        res.status(500).json(fail("Não foi possível localizar o Buffet"))
    })
})

//Delete Specific Buffet
router.delete("/:id",vToken.isAdmin, (req, res) => {
    BuffetDAO.delete(req.params.id).then(buffet => {
        res.json(sucess(buffet, 'Buffet Deletado'))
    }).catch(err => {
        console.log(err)
        res.status(500).json(fail("Não foi possível deletar o Buffet"))
    })
})

//Change specific Buffet
router.put("/:id",vToken.isAdmin, async (req, res) => {
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

//Register new buffet
router.post("/", vToken.isAdmin, async (req, res) => {
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
