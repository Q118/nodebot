const express = require('express');

const { createEventAdapter } = require('@slack/events-api');

const router = express.Router();

module.exports = (params) => {
    const { config } = params; // destructuring.. config will be the config property of the params object

    const slackEvents = createEventAdapter(config.slack.signingSecret);

    router.use('/events', slackEvents.requestListener()); //? this event-middleware looks for registered event handlers that will be executed when an event occurs.
    //then we register it with 'on' method.

    slackEvents.on('app_mention', (event) => {
        console.log(`Received mention event: ${JSON.stringify(event)}`);
    })

    return router;
}
