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

        const extractedProper = {};

        Object.keys(entities).forEach((key) => {
            if (entities[key][0].confidence > 0.7) {
                extractedEntities[key] = entities[key][0].value;
            }
        });
        if (intents && intents[0].name === 'reservation') {
            extractedProper.intent = 'reservation';
        };
        extractedProper.customerName = extractedEntities["wit$contact:customerName"];
        extractedProper.reservationDateTime = extractedEntities["wit$datetime:reservationDateTime"];
        extractedProper.numberOfGuests = extractedEntities["wit$number:numberOfGuests"];

        //? console.log("extracted: " + JSON.stringify(extractedProper, undefined, 2));
        return extractedProper;
    }
}

module.exports = WitService;