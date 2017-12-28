// connect to service bus
var azure = require('azure-sb');
var serviceBusService = azure.createServiceBusService(process.env['MonitoredServiceBusEndpoint']);

// connect to AppsInsights
var appInsights = require("applicationinsights");
appInsights.setup().setAutoDependencyCorrelation(false).start();
var client = new appInsights.TelemetryClient(process.env['ApplicationInsightsWithSBData']);

// name - human readable name in AppsInsights, id - what is exposed by service bus
const metrics = [
    { name: "Active Message Count", id: "d2p1:ActiveMessageCount" },
    { name: "Dead Letter Message Count", id: "d2p1:DeadLetterMessageCount" },
    { name: "Scheduled Message Count", id: "d2p1:ScheduledMessageCount" },
    { name: "Transfer Message Count", id: "d2p1:TransferMessageCount" },
    { name: "Transfer Dead Letter Message Count", id: "d2p1:TransferDeadLetterMessageCount" }
];

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    serviceBusService.listQueues(function (error, listqueuesresult, response) {
        // in the list of queues we already receive all the metrics
        listqueuesresult.forEach(function (element) {
            // send data to apps insight
            metrics.forEach(function (metric) {
                client.trackMetric({
                    name: element.QueueName + " - " + metric.name,
                    value: element.CountDetails[metric.id]
                });
                context.log("Sending "+JSON.stringify({
                    name: element.QueueName + " - " + metric.name,
                    value: element.CountDetails[metric.id]
                }));
            });
        }, this);
    });

    context.done();
};