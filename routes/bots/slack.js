const express = require('express');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const moment = require('moment');

const ConversationService = require('../../services/ConversationService');

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

  const processEvent = async (session, event) => {
    const mention = /<@[A-Z0-9]+>/;
    const eventText = event.text.replace(mention, '').trim();
    // console.log("event text: " + eventText); //debug

    const context = await ConversationService.run(witService, eventText, session.context);
    const { conversation } = context;
    const { entities } = conversation;

    console.log("entities: " + JSON.stringify(entities, undefined, 2)); //debug

    let text = '';

    if (!conversation.complete) {
      text = conversation.followUp;
    } else {
      // const entities = await witService.query(eventText);
      const {
        intent,
        customerName,
        reservationDateTime,
        numberOfGuests
      } = entities;

      const reservationResult = await reservationService
        .tryReservation(moment(reservationDateTime).unix(), numberOfGuests, customerName);
      text = reservationResult.success || reservationResult.error;
    }

    if (conversation.exit || conversation.complete) { //everything was fulfilled-all args are present
      session.context.conversation = {};
    }

    return slackWebClient.chat.postMessage({
      text,
      channel: session.context.slack.channel,
      thread_ts: session.context.slack.thread_ts,
      username: 'Resi',
    });
  }

  const handleMention = async (event) => {
    const sessionId = createSessionId(event.channel, event.user, event.thread_ts || event.ts);
    let session = sessionService.get(sessionId); //returns false if no session
    if (!session) {
      session = sessionService.create(sessionId);
      session.context = {
        slack: {
          channel: event.channel,
          user: event.user,
          thread_ts: event.thread_ts || event.ts,
        }
      }
    }
    return processEvent(session, event);
  }

  const handleMessage = async (event) => {
    const sessionId = createSessionId(event.channel, event.user, event.thread_ts || event.ts);
    const session = sessionService.get(sessionId);
    if (!session) return false;
    return processEvent(session, event);
  }

  slackEvents.on('app_mention', handleMention);
  slackEvents.on('message', handleMessage);

  return router;
};