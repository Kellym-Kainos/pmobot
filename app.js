var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');
var botMiddleware = require('./middleware')

require('dotenv').config()

//Server setup
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('listening to %s and luis:%s', server.url, process.env.LUIS_ENDPOINT);
});

//Bot setup
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);

const intents = new builder.IntentDialog({
    recognizers: [
        new builder.LuisRecognizer(process.env.LUIS_ENDPOINT)
            ],
    intentThreshold: 0.4,
    recognizeOrder: builder.RecognizeOrder.parallel
});

intents.matches('greeting', '/greeting');
intents.matches('prevYearHol', '/prevYearHol');
intents.matches('emptyDashboard', '/emptyDashboard');
intents.matches('holidayCode', '/holidayCode');
intents.matches('cancelHoliday', '/cancelHoliday');
intents.matches('approvePrivileges', '/approvePrivileges');
intents.matches('buySellHoliday', '/buySellHoliday');
intents.matches('mandatoryField', '/mandatoryField');
intents.matches('dayInLieu', '/dayInLieu');
intents.matches('missingTimecode', '/missingTimecode');
intents.matches('sick', '/sick');
intents.matches('timesheetDeadline', '/timesheetDeadline');
intents.matches('carryHolidays', '/carryHolidays');
intents.matches('bookHolidays', '/bookHolidays');
intents.matches('claimExpenses', '/claimExpenses');
intents.matches('pmoInfo', '/pmoInfo');

intents.matches('support', require('./support'));


intents.onDefault(function (session) {
        session.send('Sorry, I did not understand \'%s\'. Please contact: the following: \n - Digital Services: digitalservicespmo@kainos.com \n - Smart: Jayne Carson j.carson@kainos.com \n - Everyone else - PMO@Kainos.com', session.message.text);
    });

//Listen for messages
server.post('/api/messages', connector.listen());

bot.use({
   botbuilder: function (session, next){
       botMiddleware.delayResponseTyping(session);
    next();
   }
});

//Dialogs
bot.dialog('/', intents);

bot.dialog('/greeting', function(session){
    session.endDialog("Hello. I'm Peggy the PMO bot. I will try to answer your PMO questions.");
});

bot.dialog('/prevYearHol', function(session){
    session.endDialog("All of your remaining holiday totals accumulate to one total which can be accessed by using the current holiday code");
});

bot.dialog('/emptyDashboard', function(session){
    session.endDialog("We have missed some settings on your account, message PMO@kainos.com to fix this.");
});

bot.dialog('/holidayCode', function(session){
    session.endDialog("Please make sure you are submitting your holidays through Gridview.  Everyone has a holiday code.");
});

bot.dialog('/cancelHoliday', function(session){
    session.endDialog("Your timesheet will need to be reverted please contact: the following: \n - Digital Services: digitalservicespmo@kainos.com \n - Smart: j.carson@kainos.com \n - Everyone else: PMO@Kainos.com ");
});

bot.dialog('/approvePrivileges', function(session){
    session.endDialog("Your permissions will need to be upgraded, depending on your grade this may need approval from your manager.");
});

bot.dialog('/buySellHoliday', function(session){
    session.endDialog("Request approval from your manager for the amount of days you wish to buy/sell, forward the approval email to People Support.");
});

bot.dialog('/mandatoryField', function(session){
    session.endDialog("You have missed a mandatory field on your entry, please check these are all complete - the best way to view this is calendar view.");
});

bot.dialog('/dayInLieu', function(session){
    session.endDialog(" Request approval for the day in lieu from your manager, forward the approval email to People Support");
});

bot.dialog('/missingTimecode', function(session){
    session.endDialog("Please contact your project manager.");
});

bot.dialog('/contacts', function(session){
    session.endDialog('Please contact: the following: \n - Digital Services: digitalservicespmo@kainos.com \n - Smart: Jayne Carson j.carson@kainos.com \n - Everyone else - PMO@Kainos.com');
});

bot.dialog('/sick', function(session){
    session.endDialog("Please use your BU's Sick code (e.g. Digital Services - Sick) If you will be off sick for more than the standard 5 days (self certifiable) you will need to contact People Support with a Doctors note. ");
});

bot.dialog('/timesheetDeadline',function(session){
    session.endDialog("Please fill in and submit your timesheet by CoB on a Friday, if the month ends midweek, please ensure your timesheets are completed for the whole month and submit before CoB on the last day of the month. ");    
});

bot.dialog('/carryHolidays',function(session){
    session.endDialog("The maximum number of holiday days that can be carried over to the next year is 5. Please contact your PM if you need to carry over more than 5 days.");    
});

bot.dialog('/bookHolidays',function(session){
    session.endDialog("Please book all holidays through your Kimble timesheet in Grid View mode. Any holidays submitted via Calendar view will not register correctly. Add holidays as you would a standard work day and click submit, these will then be sent through to your Kimble manager for approval. ");    
});

bot.dialog('/claimExpenses',function(session){
    session.endDialog("Expenses are claimed through Kimble against the project code they were incurred against. For expenses guildlines please see the guildline documents for specific locations on the Finance OneDrive page - https://tinyurl.com/ya98rrtp ");    
});

bot.dialog('/pmoInfo',function(session){
    session.endDialog('PMO is the "Project Management Office" within Kainos. For more information and an expample of PMO updates, please check out the PMO page on Yammer. ');    
});



bot.dialog('/holiday', [function(session){
    //session.sendTyping();
    setTimeout(function () {
        builder.Prompts.choice(session,"I know the following about holidays. Please select an option below to find out more information:", "Buy/Sell Holidays|Cancel Holidays|Holiday Timecode|Carrying Over Holidays | Days in Lieu | I need more information", { listStyle: builder.ListStyle.button });         
    }, 2000);},
function(session, results){
    switch(results.response.index){
        case 0:
            session.beginDialog('/buySellHoliday');
            break;
        case 1:
            session.beginDialog('/cancelHoliday');
            break;
        case 2:
            session.beginDialog('/holidayCode');
            break;
        case 3:
            session.beginDialog('/prevYearHol');
            break;
        case 4:
            session.beginDialog('/dayInLieu');
            break;
        case 5:
            session.beginDialog('/contacts', []);
            break;
    }
}]).triggerAction({
    matches: [/^holiday/i, /^holidays/i, /^annual leave/i]
});