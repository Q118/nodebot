const { Wit } = require('node-wit');

class WitService {
    constructor(accessToken) {
        this.client = new Wit({ accessToken });
    }

    async query(text) {
        const queryResult = await this.client.message(text);
        const { intents, entities } = queryResult;
        //? console.log("res: " + JSON.stringify(queryResult, null, 2));
        const extractedEntities = {};

        Object.keys(entities).forEach((key) => {
            if (entities[key][0].confidence > 0.7) {
                console.log("confidence high enough.");
                if (key.toString().includes('contact')) {
                    extractedEntities["customerName"] = entities[key][0].value;
                } else if (key.toString().includes('number')) {
                    extractedEntities["numberOfGuests"] = entities[key][0].value;
                } else if (key.toString().includes('datetime')) {
                    extractedEntities["reservationDateTime"] = entities[key][0].value;
                }
            }
        });
        if (intents && intents[0].confidence > 0.7) {
            if (intents[0].name === 'reservation') {
                extractedEntities.intent = 'reservation';
            } else if (intents[0].name === 'bye') {
                extractedEntities.intent = 'bye';
            } else if (intents[0].name === 'greetings') {
                extractedEntities.intent = 'greetings';
            }
        }
        console.log("extracted: " + JSON.stringify(extractedEntities, undefined, 2));
        return extractedEntities;
    }
}

module.exports = WitService;