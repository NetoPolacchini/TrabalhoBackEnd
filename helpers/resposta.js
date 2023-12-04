module.exports = {
    sucess: function(obj, name, message) {
        let resp = {status: true}
        if (name) resp[name] = obj
        else resp.obj = obj

        return {resp: resp, message: message}
    },
    fail: function(message) {
        return {status: false, message: message}
    }
}
