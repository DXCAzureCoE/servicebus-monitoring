module.exports = function (context, myTimer) {
    var azure = require('azure-sb');
    var serviceBusService = azure.createServiceBusService(process.env['MonitoredServiceBusEndpoint']);

    var message = {
        body: 'Test message',
        customProperties: {
            assetId: 'abrakadabra1234'
        }
    }

    // send 30 messages
    for (i = 0; i < 30; i++) {
        serviceBusService.sendQueueMessage(process.env['ServiceBusQueueName'], message, function (error) {
            if (!error) {
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: "Message sent"
                };
            } else {
                context.res = {
                    status: 500, /* Defaults to 200 */
                    body: "Error while sending message:" + error
                };
            }
        });
    }
    context.done();
};