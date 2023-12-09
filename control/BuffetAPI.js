const express = require("express")
const router = express.Router()
const vToken = require('../helpers/authenticate');
const {sucess, fail} = require("../helpers/resposta")
const BuffetDAO = require('../model/Buffet')
const HallDAO = require("../model/Hall");



/**
 * @swagger
 * /:
 *   get:
 *     summary: Retorna uma lista de buffets
 *     tags:
 *          - Buffet
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número máximo de buffets a serem retornados (opcional, padrão 5)
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número da página a ser retornada (opcional, padrão 1)
 *     responses:
 *       200:
 *         description: Sucesso ao obter a lista de buffets
 *         content:
 *           application/json:
 *             example:
 *               message: Buffets obtidos com sucesso
 *               data:
 *                 buffets: [...]
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Erro interno do servidor
 */
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

/**
 * @swagger
 * /buffets/{id}:
 *   get:
 *     summary: Retorna um buffet pelo ID
 *     tags:
 *          - Buffet
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do buffet a ser retornado
 *     responses:
 *       200:
 *         description: Sucesso ao obter o buffet pelo ID
 *         content:
 *           application/json:
 *             example:
 *               message: Buffet localizado com sucesso
 *               data:
 *                 buffet: {...}
 *       404:
 *         description: Buffet não encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: Buffet não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Erro interno do servidor
 */
router.get("/:id", (req, res) => {
    BuffetDAO.getById(req.params.id).then(buffet => {
        res.json(sucess(buffet, 'Buffet Localizado'))
    }).catch(err => {
        console.log(err)
        res.status(500).json(fail("Não foi possível localizar o Buffet"))
    })
})

/**
 * @swagger
 * /buffets/{id}:
 *   delete:
 *     summary: Deleta um buffet pelo ID (Requer autenticação de administrador)
 *     tags:
 *          - Buffet
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do buffet a ser deletado
 *     responses:
 *       200:
 *         description: Sucesso ao deletar o buffet pelo ID
 *         content:
 *           application/json:
 *             example:
 *               message: Buffet deletado com sucesso
 *       404:
 *         description: Buffet não encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: Buffet não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Não foi possível deletar o Buffet
 */
router.delete("/:id",vToken.isAdmin, (req, res) => {
    BuffetDAO.delete(req.params.id).then(buffet => {
        res.json(sucess(buffet, 'Buffet Deletado'))
    }).catch(err => {
        console.log(err)
        res.status(500).json(fail("Não foi possível deletar o Buffet"))
    })
})

/**
 * @swagger
 * /buffets/{id}:
 *   put:
 *     summary: Atualiza um buffet pelo ID (Requer autenticação de administrador)
 *     tags:
 *          - Buffet
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do buffet a ser atualizado
 *       - in: body
 *         name: body
 *         required: true
 *         description: Dados atualizados do buffet
 *         schema:
 *           type: object
 *           properties:
 *              example:
 *                  nome: string
 *                  tipoComida: string
 *     responses:
 *       200:
 *         description: Sucesso ao atualizar o buffet pelo ID
 *         content:
 *           application/json:
 *             example:
 *               message: Dados do buffet atualizados com sucesso
 *       404:
 *         description: Buffet não encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: Buffet não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao atualizar dados do Buffet
 */
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

/**
 * @swagger
 * /buffets:
 *   post:
 *     summary: Cria um novo buffet (Requer autenticação de administrador)
 *     tags:
 *          - Buffet
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nome: Nome do Buffet
 *             tipoComida: Tipo de comida oferecido
 *     responses:
 *       200:
 *         description: Sucesso ao criar um novo buffet
 *         content:
 *           application/json:
 *             example:
 *               message: Buffet criado com sucesso
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao salvar o novo Buffet
 */
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
