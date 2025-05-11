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

    let events = new Array();
    if (iEvents.page.totalElements !== 0) {
    iEvents._embedded.events.forEach(data => {
        let event ={};

        event.ID = data.id;
        event.name = data.name;
        event.localDate = data.dates.start.dateTime;
        //event.venue = data.venues.name;
        event.artist = data.info;
        event.address = data.pleaseNote;
        //event.priceMin = writers;
        //event.priceMax = actors;
        //event.currency = data.Plot;

        events.push(event);
    });
    return events;

}
else {
        let event ={};
        event.ID = "";
        event.name = "No Event found";
        event.localDate = "";
        //event.venue = data.venues.name;
        event.artist = "";
        event.address = "";
        events.push(event);
        return events;
    }
}


module.exports = formatEvents;