/*Flights:
    We need:
    name: $string
departureTime time
arrivalTime: time
departureAirport: $string
arrivalAirport: $string
price: $double
currency: $string

 */
function formatFlight(inputFlights) {

    let iFlights = JSON.parse(inputFlights);

    let flights = new Array();
    if (iFlights.data.lenght !== 0) {
        iFlights.data.forEach(data => {
            let flight ={};

            flight.ID = data.id;
            //flight.name = data.itineraries.[0].duration;
            //flight.departureDateTime = data.itineraries.segments.departure.at;
            //flight.arrivalTime = data.itineraries.segments.arrival.at;
            //flight.departureAirport = data.departureAirport;
            //flight.arrivalAirport = data.arrivalAirport;
            flight.price = data.price.total;
            flight.currency = data.price.currency;

            flights.push(flight);
        });
        return flights;

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

module.exports = formatFlight;