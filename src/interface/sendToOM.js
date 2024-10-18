const axios = require('axios');

module.exports.sendToOMXML = async function(XML) {

    /** Chamada ao OM (ITCore) */
    const urlOM = 'http://sompx02:7003/cwf/services/CRMListenerInterface';
    const soapAction = 'http://oi.com.br/ifaceCRM/ReceiveFromCRM';

    try {

        const response = await axios.post(urlOM, XML, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': soapAction
            }
        });
        
        return response.data;

    } catch (error) {
        return error;
    }

}