/**
 * Use:
 * Adapt the different possible APIs into a single project.
 *
 * foreach service will be an adapter.
 * please call them the following:
 * accomodationAdapter[Name](accomodation){}
 * 
 * We need:
 * name (name of the location),
 * startDate (start of accomodation),
 * endDate (end of accomation),
 * address (address of the accomodation),
 * images (images as an external url if possible)
 * price (optional)
 * currency: $string
 * people: $int
 *
 * Flights:
 * We need:
 * name: $string
 * departureTime time
 * arrivalTime: time
 * departureAirport: $string
 * arrivalAirport: $string
 * price: $double
 * currency: $string
 * 
 * Events:
 * We need:
 * name: $string
 * startTime: $dateTime
 * venue: $string
 * artists: $string[]
 * address: $string
 * priceMin: $double
 * priceHMax: $double
 * currency: $string
 * accomodationAdapter1 is just a sample.
 * 
 * @param {*} accomodation 
 * @returns finalAccomodation
 */

function accomodationAdapter1(accomodation) {
    let object;
    object.name = accomodation.title;
    object.time = accomodation.time;
    object.address = accomodation.address;
    return object;
}