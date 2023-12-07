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
    preco: Number
})

const HallModel = mongoose.model('Hall', HallSchema)
module.exports = {

    delete: async function (id) {
        return HallModel.findByIdAndDelete(id);
    },

    getById: async function (id) {
        return HallModel.findById(id).lean();
    },

    list: async function(){
        return HallModel.find({}).lean();
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
