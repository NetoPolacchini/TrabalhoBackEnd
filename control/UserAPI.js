const express = require('express');
const router = express.Router();
const {sucess, fail} = require("../helpers/resposta");
const UserDAO = require('../model/User');
const HallDAO = require('../model/Hall')
const BuffetDAO = require('../model/Buffet')
const vToken = require('../helpers/authenticate');


/**
 * @swagger
 * /cadastro:
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags:
 *          - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sucesso ao cadastrar usuário
 *         content:
 *           application/json:
 *             example:
 *               message: Sucesso!
 *               data:
 *                 user: {...}
 *       400:
 *         description: E-mail já registrado
 *         content:
 *           application/json:
 *             example:
 *               message: E-mail já registrado
 *       500:
 *         description: Falha ao salvar o novo Usuário
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao salvar o novo Usuário
 */
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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autentica um usuário
 *     tags:
 *          - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailFornecido:
 *                 type: string
 *               senhaFornecida:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário autenticado com sucesso
 *         headers:
 *           authorization:
 *             description: Token de autenticação
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             example:
 *               message: Usuário autenticado com sucesso
 *               data: {...}
 *       400:
 *         description: Erro ao autenticar
 *         content:
 *           application/json:
 *             example:
 *               message: Erro ao autenticar
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Erro interno do servidor
 */
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

/**
 * @swagger
 * /admin/create:
 *   post:
 *     summary: Cria um novo usuário administrador
 *     tags:
 *          - Admin
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário administrador criado com sucesso
 *         content:
 *           application/json:
 *             example:
 *               message: Usuário administrador criado com sucesso
 *               data: {...}
 *       400:
 *         description: E-mail já registrado ou outros erros de entrada
 *         content:
 *           application/json:
 *             example:
 *               message: E-mail já registrado ou outros erros de entrada
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Erro interno do servidor
 */
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

/**
 * @swagger
 * /admin/listNonAdmin:
 *   get:
 *     summary: Retorna uma lista de usuários não administradores
 *     tags:
 *          - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número máximo de usuários a serem retornados (opcional, padrão 5)
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número da página a ser retornada (opcional, padrão 1)
 *     responses:
 *       200:
 *         description: Sucesso ao obter a lista de usuários não administradores
 *         content:
 *           application/json:
 *             example:
 *               message: Usuários não administradores obtidos com sucesso
 *               data:
 *                 users: [...]
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Erro interno do servidor
 */
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

/**
 * @swagger
 * /admin/listNonAdmin/delete/{id}:
 *   delete:
 *     summary: Deleta um usuário não administrador
 *     tags:
 *          - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário não administrador a ser deletado
 *     responses:
 *       200:
 *         description: Usuário não administrador deletado com sucesso
 *         content:
 *           application/json:
 *             example:
 *               message: Usuário não administrador deletado com sucesso
 *               data: {...}
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Erro interno do servidor
 */
router.delete('/admin/listNonAdmin/delete/:id',vToken.isAdmin, async(req, res) => {
    try{
        const user = await UserDAO.delete(req.params.id)
        res.json(sucess(user, 'Usuário Deletado'))
    } catch (err){
        res.json(err.message)
    }
});

/**
 * @swagger
 * /admin/listNonAdmin/update/{id}:
 *   put:
 *     summary: Atualiza os dados de um usuário não administrador
 *     tags:
 *          - Admin
 *     security:
 *       - BearerAuth: [] # Adicione a tag de autenticação BearerAuth para a rota
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário não administrador a ser atualizado
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *           example:
 *             nome: string
 *             email: string
 *             senha: string
 *     responses:
 *       200:
 *         description: Dados do usuário não administrador atualizados com sucesso
 *         content:
 *           application/json:
 *             example:
 *               message: Os dados do usuário foram atualizados
 *               data: {...}
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao atualizar dados do Usuário
 */
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

/**
 * @swagger
 * /updateUser:
 *   put:
 *     summary: Atualiza os dados do próprio usuário
 *     tags:
 *          - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *           example:
 *             nome: string
 *             email: string
 *             senha: senha
 *     responses:
 *       200:
 *         description: Dados do usuário atualizados com sucesso
 *         content:
 *           application/json:
 *             example:
 *               message: Os dados do usuário foram atualizados
 *               data: {...}
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao atualizar dados do Usuário
 */
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

/**
 * @swagger
 * /disponiveis:
 *   get:
 *     summary: Retorna salões e buffets disponíveis
 *     tags:
 *          - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *         description: Número máximo de resultados a serem retornados (opcional, padrão 5)
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *         description: Número da página a ser retornada (opcional, padrão 1)
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *         description: Data para filtrar salões disponíveis (opcional)
 *     responses:
 *       200:
 *         description: Sucesso ao obter salões e buffets disponíveis
 *         content:
 *           application/json:
 *             example:
 *               message: Lista de Salões e buffets disponíveis
 *               data:
 *                 halls: [...]
 *                 buffets: [...]
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Erro interno do servidor
 */
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



/**
 * @swagger
 * /disponiveis:
 *   put:
 *     summary: Aluga salão e buffet
 *     tags:
 *          - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *         description: Data para alugar salão e buffet (opcional)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             idSalao: 1
 *             idBuffet: 1
 *     responses:
 *       200:
 *         description: Sucesso ao alugar salão e buffet
 *         content:
 *           application/json:
 *             example:
 *               message: Salão e buffet alugados com sucesso
 *               data: {...}
 *       404:
 *         description: Salão ou buffet não encontrado. Insira ID's válidos.
 *         content:
 *           application/json:
 *             example:
 *               message: Salão ou buffet não encontrado. Insira ID's válidos.
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             example:
 *               message: Erro interno do servidor
 */
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
