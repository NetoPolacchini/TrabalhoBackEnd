module.exports = {
    sucess: function(obj, message) {
        let resp = {status: true}
        resp.obj = obj

        return {message, resp}
    },
    fail: function(message) {
        return {status: false, message: message}
    }
}
