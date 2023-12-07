const mongoose = require("mongoose")

const BuffetSchema = new mongoose.Schema({
    nome: String,
    tipoComida: String
})

const BuffetModel = mongoose.model('Buffet', BuffetSchema)

module.exports = {

    list: async function(){
        return BuffetModel.find({}).lean();
    },

    delete: async function (id) {
        return BuffetModel.findByIdAndDelete(id);
    },

    getById: async function (id) {
        return BuffetModel.findById(id).lean();
    },

    save: async function(nome, tipoComida){
        const buffet = new BuffetModel({
            nome: nome,
            tipoComida: tipoComida
        })

        try {
            await buffet.save();
            console.log('Buffet salvo com sucesso:', buffet);
            return buffet;
        } catch (error) {
            console.error('Erro ao salvar Buffet:', error);
            throw error;
        }
    },

    update: async function(id, obj) {

        try{
            let buffet = await BuffetModel.findById(id);

            if(!buffet){
                return false;
            }
            Object.assign(buffet, obj);
            await buffet.save();
            console.log('Buffet atualizado com sucesso:', buffet);
            return buffet;
        } catch (err){
            console.error('Erro durante a atualização', err)
            throw err;
        }
    },

}
