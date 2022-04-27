const express = require('express');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const moment = require('moment');

const router = express.Router();

const createSessionId = (channel, user, ts) => {
  return `${channel}-${user}-${ts}`;
}

module.exports = (params) => {
  const { config,
    witService,
    reservationService,
    sessionService
  } = params;
  const slackEvents = createEventAdapter(config.slack.signingSecret);
  const slackWebClient = new WebClient(config.slack.token);

  router.use('/events', slackEvents.requestListener());

  async function handleMention(event) {
    const mention = /<@[A-Z0-9]+>/;
    const eventText = event.text.replace(mention, '').trim();
    // console.log("event text: " + eventText); //debug
    let text = '';

    if (!eventText) {
      text = 'Hey!';
    } else {
      const entities = await witService.query(eventText);
      const { intent } = entities;
      const customerName = entities["wit$contact:customerName"];
      const reservationDateTime = entities["wit$datetime:reservationDateTime"];
      const numberOfGuests = entities["wit$number:numberOfGuests"];
      // console.log(`intent: ${intent}. customerName: ${customerName}. reservationDateTime: ${reservationDateTime}. numberOfGuests: ${numberOfGuests}`); //debug
      if (!intent || intent !== 'reservation' || !customerName || !reservationDateTime || !numberOfGuests) {
        text = 'Sorry - could you rephrase that?';
      } else {
        const reservationResult = await reservationService
          .tryReservation(moment(reservationDateTime).unix(), numberOfGuests, customerName);
        text = reservationResult.success || reservationResult.error;
      }
    }

    return slackWebClient.chat.postMessage({
      text,
      channel: event.channel,
      username: 'Resi',
    });
  }

  slackEvents.on('app_mention', handleMention);

  return router;
};