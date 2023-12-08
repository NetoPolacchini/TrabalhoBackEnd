const mongoose = require("mongoose")

const HallSchema = new mongoose.Schema( {
    nome: String,
    endereco: {
        rua: String,
        numero: String,
        bairro: String,
        cidade: String,
        cep: String
    },
    capacidadeMaxima: Number,
    preco: Number,
    disponibilidade: [{
        data: Date
    }]
})

const HallModel = mongoose.model('Hall', HallSchema)
module.exports = {

    HallModel,

    delete: async function (id) {
        return HallModel.findByIdAndDelete(id);
    },

    getById: async function (id) {
        return HallModel.findById(id).lean();
    },

    getByIdAndDate: async function (id, data) {
        try {
            const hall = await HallModel.findOne({
                _id: id,
                disponibilidade: {
                    $not: {
                        $elemMatch: {
                            data: data
                        }
                    }
                }
            }).lean();

            console.log(hall)

            if (!hall) {
                throw new Error('Salao nao esta disponivel');
            }

            return true;
        } catch (err) {
            throw err;
        }
    },

    listDisponiveis: async function (limite, pagina, data) {
        try {
            if (![5, 10, 30].includes(limite)) {
                throw new Error('Limite inválido. Use 5, 10 ou 30.');
            }

            const startIndex = (pagina - 1) * limite;

            const halls = await HallModel.find({
                disponibilidade: {
                    $not:{
                        $elemMatch: {
                            data: data
                        }
                    }
                }
            }).skip(startIndex).limit(limite).lean();

            if(!halls){
                throw new Error('Não há salões disponíveis para a data fornecida');
            }

            return halls;
        } catch (err) {
            console.error('Erro ao listar Salões Disponíveis:', err);
            throw err;
        }
    },

    list: async function(limite, pagina){

        if (![5, 10, 30].includes(limite)) {
            throw new Error('Limite inválido. Use 5, 10 ou 30.');
        }

        try {
            const startIndex = (pagina - 1) * limite;

            return await HallModel.find({}).skip(startIndex).limit(limite).lean()

        } catch (err) {
            console.error('Erro ao listar Salões:', err);
            throw err;
        }
    },

    save: async function(nome, endereco, capacidadeMaxima, preco){
        const hall = new HallModel({
            nome: nome,
            endereco: endereco,
            capacidadeMaxima: capacidadeMaxima,
            preco: preco
        })

        try {
            await hall.save();
            console.log('Salão salvo com sucesso:', hall);
            return hall;
        } catch (error) {
            console.error('Erro ao salvar Salão:', error);
            throw error;
        }
    },

    update: async function(id, obj) {

        try{
            let hall = await HallModel.findById(id);

            if(!hall){
                return false;
            }
            Object.assign(hall, obj);
            await hall.save();
            return hall;
        } catch (err){
            console.error('Erro durante a atualização', err)
            throw err;
        }
    },

}
