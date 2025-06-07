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
    const iEvents = JSON.parse(inputEvents);
    const events = [];
    let eventList = []; // This will hold the array of events to iterate over

    // --- Step 1: Check if the data is a list or a single event ---
    // Case A: Data is a search result with an _embedded.events array
    if (iEvents._embedded && iEvents._embedded.events) {
        eventList = iEvents._embedded.events;
    }
    // Case B: Data is a single event object itself
    else if (iEvents.type === 'event') {
        eventList.push(iEvents); // Put the single event into an array so we can use the same loop
    }

    // --- Step 2: Process the list (whether it has one or many events) ---
    if (eventList.length > 0) {
        eventList.forEach(data => {
            const event = {};

            // Safely get venue and attraction data, allowing them to be null if not present
            const venueData = (data._embedded && data._embedded.venues && data._embedded.venues[0]) ? data._embedded.venues[0] : null;
            const attractionData = (data._embedded && data._embedded.attractions && data._embedded.attractions[0]) ? data._embedded.attractions[0] : null;

            event.ID = data.id;
            event.localDate = data.dates.start.localDate;
            event.localTime = data.dates.start.localTime;

            // --- **CORE LOGIC FOR ARTIST NAME** ---
            // If attraction data exists, use it for the artist name.
            if (attractionData && attractionData.name) {
                event.artist = attractionData.name;
                event.name = data.name; // e.g., Event: "Billie Marten", Artist: "Billie Marten"
            } else {
                // Otherwise, fall back to the event's main name for the artist.
                event.artist = data.name; // e.g., Event: "TATE MCRAE", Artist: "TATE MCRAE"
                event.name = data.name;
            }

            // Safely get venue and address info
            if (venueData) {
                event.venue = venueData.name;
                const addressParts = [
                    venueData.address ? venueData.address.line1 : null,
                    venueData.city ? venueData.city.name : null,
                    venueData.state ? venueData.state.name : null,
                    venueData.postalCode
                ];
                event.address = addressParts.filter(part => part).join(', ');
            } else {
                event.venue = 'Venue not specified';
                event.address = 'Address not specified';
            }

            events.push(event);
        });
    }

    // --- Step 3: Handle the case where no events were found or processed ---
    if (events.length === 0) {
        return [{
            ID: "", name: "No Event found", localDate: "", localTime: "",
            venue: "", artist: "", address: ""
        }];
    }

    return events;
}

module.exports = formatEvents;