/*Events:
    We need:
    name: $string
startTime: $dateTime
venue: $string
artists: $string[]
address: $string
priceMin: $double
priceHMax: $double
currency: $string
*/
function formatEvents(inputEvents) {

    let iEvents = JSON.parse(inputEvents);

    let event = {};
    if (iEvents.id) {



        event.ID = iEvents.id;
        event.name = iEvents.name;
        event.localDate = iEvents.dates.start.dateTime;
        //event.venue = data.venues.name;
        event.artist = iEvents.url;
        event.address = iEvents.pleaseNote;
        //event.priceMin = writers;
        //event.priceMax = actors;
        //event.currency = data.Plot;



    return event;

}
else {
        event.ID = "";
        event.name = "Event not found";
        event.localDate = "";
        //event.venue = data.venues.name;
        event.artist = "";
        event.address = "";
        return event;
    }
}


module.exports = formatEvents;