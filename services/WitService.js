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
                extractedEntities[key] = entities[key][0].value;
            }
        });
        if (intents && intents[0].name === 'reservation') {
            extractedEntities.intent = 'reservation';
        }
        //? console.log("extracted: " + JSON.stringify(extractedEntities, undefined, 2));
        return extractedEntities;
    }
}

module.exports = WitService;