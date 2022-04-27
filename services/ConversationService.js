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
        const entities = await witService.query(text);
        // use '...' to merge objects, below merges the entities we have already on the conversation plus the entities we just got
        context.conversation.entities = { ...context.conversation.entities, ...entities }; //! if a property exists in both objects, then then second entity's object will override it
        if (context.conversation.entities.intent === 'reservation') {
            return ConversationService.intentReservation(context);
        }
        context.conversation.followUp = 'Could you rephrase that?';
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



