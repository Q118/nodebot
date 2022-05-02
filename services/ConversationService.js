class ConversationService {
    //this class wont hold any state
    static async run(witService, text, context) { // text for NLP
        if (!context.conversation) {
            context.conversation = {
                entities: {},
                followUp: '',
                complete: false,
                exit: false,
            };
        }

        if (!text) {
            context.conversation.followUp = "Hey back!"
            return context;
        }

        const entities = await witService.query(text);
        // use '...' to merge objects, below merges the entities we have already on the conversation plus the entities we just got
        context.conversation.entities = { ...context.conversation.entities, ...entities }; //! if a property exists in both objects, then the second entities object will override it
        
        //if bye is the intent, all else can be ignored
        if(context.conversation.entities.intent === 'bye') {
            context.conversation.followUp = 'Ok, bye!';
            context.conversation.exit = true;
        }
        
        if (context.conversation.entities.intent === 'reservation') {
            console.log("! can we get here!")
            return ConversationService.intentReservation(context);
        }
        context.conversation.followUp = 'Could you rephrase that?';
        console.log('context.conversation.entities: ', context.conversation.entities);
        return context;
    }

    static intentReservation(context) {
        const { conversation } = context;
        const { entities } = conversation;
        if (!entities.reservationDateTime) {
            conversation.followUp = 'For when would you want to make your reservation?';
            return context;
        }
        if (!entities.numberOfGuests) {
            conversation.followUp = 'For how many guests?';
            return context;
        }
        if (!entities.customerName) {
            conversation.followUp = 'Please tell me your name';
            return context;
        }
        conversation.complete = true; // get to this point if have all the above entities
        return context;
    }
}

module.exports = ConversationService;



