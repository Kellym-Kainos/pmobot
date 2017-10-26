var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');

//Server setup
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('listening to %s', server.url);
});

//Bot setup
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector, function (session) {
    session.send('Sorry, I did not understand \'%s\'. Please contact: the following: \n - Digital Services: digitalservicespmo@kainos.com \n - Smart: Jayne Carson j.carson@kainos.com \n - Everyone else - PMO@Kainos.com', session.message.text);
});

//LUIS setup
var recognizer = new builder.LuisRecognizer("https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/52441db0-8ba8-44df-9153-f6249d4062fe?subscription-key=5811ebd525b443b8badb31bb4e380aaa&timezoneOffset=0&verbose=true");
bot.recognizer(recognizer);

bot.dialog('greeting', function(session){
    session.endDialog("Hello. I'm Peggy the PMO bot. I will try to answer your PMO questions.");

}).triggerAction({
    matches: 'greeting'
});

//Listen for messages
server.post('/api/messages', connector.listen());

bot.dialog('prevYearHol', function(session){
    session.endDialog("All of your remaining holiday totals accumulate to one total which can be accessed by using the current holiday code");

}).triggerAction({
    matches: 'prevYearHol'
});

bot.dialog('emptyDashboard', function(session){
    session.endDialog("We have missed some settings on your account, message PMO@kainos.com to fix this.");

}).triggerAction({
    matches: 'emptyDashboard'
});

bot.dialog('holidayCode', function(session){
    session.endDialog("Please make sure you are submitting your holidays through Gridview.  Everyone has a holiday code.");

}).triggerAction({
    matches: 'holidayCode'
});

bot.dialog('cancelHoliday', function(session){
    session.endDialog("Your timesheet will need to be reverted please contact: the following: \n - Digital Services: digitalservicespmo@kainos.com \n - Smart: j.carson@kainos.com \n - Everyone else: PMO@Kainos.com ");

}).triggerAction({
    matches: 'cancelHoliday'
});







