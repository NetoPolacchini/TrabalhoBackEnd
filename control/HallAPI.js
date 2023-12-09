const express = require("express")
const router = express.Router()

const {sucess, fail} = require("../helpers/resposta")
const vToken = require('../helpers/authenticate');
const HallDAO = require('../model/Hall')

/**
 * @swagger
 * /hall:
 *   get:
 *     summary: Retorna todos os salões com opções de limite e página
 *     tags:
 *          - Salao
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *         description: Número de itens a serem retornados (padrão 5)
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *         description: Número da página a ser retornada (padrão 1)
 *     responses:
 *       200:
 *         description: Sucesso ao obter salões
 *         content:
 *           application/json:
 *             example:
 *               message: Sucesso!
 *               data:
 *                 halls: [...]
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
        const halls = await HallDAO.list(limite, pagina)
        res.json(sucess(halls, "list"));
    } catch (err){
        res.status(500).json(err.message);
    }
})

/**
 * @swagger
 * /hall/{id}:
 *   get:
 *     summary: Retorna um salão específico pelo ID
 *     tags:
 *          - Salao
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do salão a ser obtido
 *     responses:
 *       200:
 *         description: Sucesso ao obter o salão pelo ID
 *         content:
 *           application/json:
 *             example:
 *               message: Sucesso!
 *               data:
 *                 hall: {...}
 *       404:
 *         description: Salão não encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: Não foi possível localizar o Salão
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Erro interno do servidor
 */
router.get("/:id", (req, res) => {
    HallDAO.getById(req.params.id)
        .then((hall) => {
            res.json(sucess(hall, 'Salão Localizado'));
        })
        .catch((err) => {
            console.log(err);
            res.status(404).json(fail('Não foi possível localizar o Salão'));
        });
});


/**
 * @swagger
 * /hall/{id}:
 *   delete:
 *     summary: Deleta um salão pelo ID (somente para administradores)
 *     tags:
 *          - Salao
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do salão a ser deletado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Salão deletado com sucesso
 *         content:
 *           application/json:
 *             example:
 *               message: Salão Deletado
 *               data:
 *                 hall: {...}
 *       401:
 *         description: Não autorizado (usuário não é um administrador)
 *         content:
 *           application/json:
 *             example:
 *               message: Usuário não tem permissão
 *       500:
 *         description: Falha ao deletar o salão
 *         content:
 *           application/json:
 *             example:
 *               message: Não foi possível deletar o Salão
 */
router.delete("/:id", vToken.isAdmin, (req, res) => {
    HallDAO.delete(req.params.id).then(hall => {
        res.json(sucess(hall, 'Salão Deletado'))
    }).catch(err => {
        console.log(err)
        res.status(500).json(fail("Não foi possível deletar o Salão"))
    })
})

/**
 * @swagger
 * /halls/{id}:
 *   put:
 *     summary: Atualiza os dados de um salão pelo ID (Requer autenticação de administrador)
 *     tags:
 *          - Salao
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do salão a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nome: string
 *             endereco:
 *               rua: string
 *               numero: string
 *               bairro: string
 *               cidade: string
 *               cep: string
 *             capacidadeMaxima: number
 *             preco: number
 *     responses:
 *       200:
 *         description: Sucesso ao atualizar os dados do salão
 *         content:
 *           application/json:
 *             example:
 *               message: Os dados do salão foram atualizados
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao atualizar dados do novo Salão
 */
router.put("/:id", vToken.isAdmin,async (req, res) => {
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


/**
 * @swagger
 * /halls:
 *   post:
 *     summary: Cria um novo salão
 *     tags:
 *          - Salao
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nome: string
 *             endereco:
 *               rua: string
 *               numero: string
 *               bairro: string
 *               cidade: string
 *               cep: string
 *             capacidadeMaxima: number
 *             preco: number
 *     responses:
 *       200:
 *         description: Sucesso ao criar um novo salão
 *         content:
 *           application/json:
 *             example:
 *               message: Sucesso!
 *               data:
 *                 hall:
 *                   nome: string
 *                   endereco:
 *                     rua: string
 *                     numero: string
 *                     bairro: string
 *                     cidade: string
 *                     cep: string
 *                   capacidadeMaxima: number
 *                   preco: number
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao salvar o novo Salão
 */
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
