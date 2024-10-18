const oracledb = require('oracledb');
const xml2js = require('xml2js');
const builder = new xml2js.Builder();

module.exports.getCloseIssueXML = async function(solicitation) {

    await oracledb.createPool({
        user: `${process.env.BDUSER}`,
        password: `${process.env.BDPASS}`,
        connectString: `${process.env.BDHOST}:${process.env.BDPORT}/${process.env.BDSERVICE}`,
        poolMin: 5,
        poolMax: 10,
        poolIncrement: 1
    });

    try {

        poolCI = await oracledb.getConnection();
    
        const result = await poolCI.execute(
            `SELECT MSGID, OPERATION, CREATION_TIME, RECEIVE_DATA FROM CWMESSAGELOG WHERE USER_DATA1 = :solicitation AND OPERATION = 'ifaceCRM:CRMListenerInterface/ReceiveFromCRM' ORDER BY CREATION_TIME FETCH FIRST 1 ROWS ONLY`,
            {solicitation: solicitation},
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        if(result.rows.length > 0){
                
            const row = result.rows[0];
            const receive_data = row.RECEIVE_DATA;

            if(receive_data){

                const xmlData = await new Promise((resolve, reject) => {

                    let xml = '';
                    receive_data.setEncoding('utf8');

                    receive_data.on('data', (chunk) => {
                        xml += chunk;
                    });

                    receive_data.on('end', () => {
                        resolve(xml);
                    });

                    receive_data.on('error', (err) => {
                        reject('Erro ao Ler o Blob: ' + err);
                    });
                });

                const parsedResult = await new Promise((resolve, reject) => {

                    xml2js.parseString(xmlData, (err, result) => {

                        if (err) {
                            reject('Erro ao executar Parse do XML: ' + err);
                        } else {
                            resolve(result);
                        }

                    });

                });
    
                let idevento = parsedResult["soapenv:Envelope"]["SOAP-ENV:Body"][0]["ifac:ProcessarOS"][0]["Pedido"][0]["IdEvento"][0];
                let ie = idevento.toString().replace('4-', '5-');
                let now = new Date();
                let versao = now.getFullYear() + ('00' + (now.getMonth() + 1)).slice(-2) + ('00' + now.getDate()).slice(-2) + ('00' + now.getHours()).slice(-2) + ('00' + now.getMinutes()).slice(-2) + ('00' + now.getSeconds()).slice(-2);
                let items = parsedResult["soapenv:Envelope"]["SOAP-ENV:Body"][0]["ifac:ProcessarOS"][0]["Pedido"][0]["ListaDeItens"][0]["ItemDaOrdem"];
                
                items.forEach(item => {
                    if (item.TipoProduto[0] === "Promoção" && item.Acao[0] === 'adicionar') {
                        item.TipoCorrecao[0] = 'P';
                    }
                });

                parsedResult["soapenv:Envelope"]["SOAP-ENV:Body"][0]["ifac:ProcessarOS"][0]["Pedido"][0]["IdEvento"][0] = ie;
                parsedResult["soapenv:Envelope"]["SOAP-ENV:Body"][0]["ifac:ProcessarOS"][0]["Pedido"][0]["Versao"][0] = versao;
                parsedResult["soapenv:Envelope"]["SOAP-ENV:Body"][0]["ifac:ProcessarOS"][0]["Pedido"][0]["ListaDeItens"][0]["ItemDaOrdem"] = items;

                let updatedXML = builder.buildObject(parsedResult);

                let uxml = {
                    status: 'success',
                    xml: updatedXML
                }

                return uxml;
    
            }else{
                console.log('Nenhum Blob encontrado!');
            }

        }else{
            console.log('Nenhuma linha encontrada!');
        }

    }catch(err){
        res.status(500).send('Erro ao conectar no banco de dados');
    }finally{
        if(poolCI){
            try {
                await poolCI.close();
            }catch(err){
                console.error(err);
            }
        }
    }

};