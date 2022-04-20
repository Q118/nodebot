const express = require('express');

const { createEventAdapter } = require('@slack/events-api');

const router = express.Router();

module.exports = (params) => {
    const { config } = params; // destructuring.. config will be the config property of the params object

    const slackEvents = createEventAdapter(config.slack.signingSecret);

    return router;
}