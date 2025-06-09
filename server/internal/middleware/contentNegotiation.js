const xml2js = require('xml2js');

const contentNegotiation = (req, res, next) => {
    // Store the original json method
    const originalJson = res.json;

    // Override the json method
    res.json = function(data) {
        // Check Accept header
        const acceptHeader = req.headers.accept || '';

        if (acceptHeader.includes('application/xml') || acceptHeader.includes('text/xml')) {
            // Convert JSON to XML
            const builder = new xml2js.Builder({
                rootName: 'response',
                headless: false
            });
            const xml = builder.buildObject(data);

            // Send XML response
            res.set('Content-Type', 'application/xml');
            return res.send(xml);
        } else {
            // Default to JSON
            return originalJson.call(this, data);
        }
    };

    next();
};

module.exports = contentNegotiation;