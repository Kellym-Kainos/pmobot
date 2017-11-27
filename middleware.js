module.exports = {
    delayResponseTyping: function (session, event) {
        session.sendTyping();
        session.delay(3000);
    },
}