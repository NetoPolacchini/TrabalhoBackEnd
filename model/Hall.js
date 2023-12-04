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
        //return await BookModel.findByIdAndUpdate(id, {$set: obj})

        let hall = await new HallModel.findById(id)
        if (!hall) {
            return false
        }

        Object.keys(obj).forEach(key => hall[key] = obj[key])
        await hall.save()
        return hall
    },

}
