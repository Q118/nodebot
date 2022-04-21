const express = require('express');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');


const router = express.Router();

module.exports = (params) => {
    const { config } = params; // destructuring.. config will be the config property of the params object

    const slackEvents = createEventAdapter(config.slack.signingSecret);
    const slackWebClient = new WebClient(config.slack.token);

    router.use('/events', slackEvents.requestListener()); //? this event-middleware looks for registered event handlers that will be executed when an event occurs.
    //then we register it with 'on' method.

    const handleMention = async (event) => {
        return slackWebClient.chat.postMessage({
            text: `Hi there, I\'m Resi. What can I do for you?`,
            channel: event.channel,
            username: 'Resi',
        });
    }

    slackEvents.on('app_mention', handleMention);
    
    return router;
}
