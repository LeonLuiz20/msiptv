const sw = require('../functions/getSolicitationWith7029');
const cixml = require('../functions/getCloseIssueXML');
const sto = require('../interface/sendToOM');
const gban = require('../functions/getBANumbers');
const gx = require('../functions/generateXLSX');

module.exports.closeAppointmentIssue = async function() {
        
    try{

        console.log('///////////////////////////////////////////////////////////////////////////////////////////');

        const now = new Date();
        const options = { timeZone: 'America/Sao_Paulo' };
        const dateBr = now.toLocaleString('pt-BR', options);

        console.log('\nIniciando processo de Encerramento de pendência cliente: ' + dateBr + '.');

        const orders = await sw.getSolicitationWith7029();

        console.log('\nForam encontradas ' + orders.qt + ' ordens com a pendência 7029.\n');

        console.log('///////////////////////////////////////////////////////////////////////////////////////////');

        let a = [];
        let count = 0;

        const now2 = new Date();
        const options2 = { timeZone: 'America/Sao_Paulo' };
        const dateBr2 = now2.toLocaleString('pt-BR', options2);
        let getDate = dateBr2;

        if(orders.qt > 0){

            for(const order of orders.solicitations){
                let aux = {
                    order: order[0],
                    status: 'obtido',
                    getDate: getDate
                }
                a.push(aux);
            }
    
            for(const aux of a){

                console.log('\nSolicitar XML e Encerramento de Pendência do Pedido ' + aux.order + '.');
    
                const xml = await cixml.getCloseIssueXML(aux.order);
    
                if(xml.status === 'success'){

                    console.log('\nXML do Pedido ' + aux.order + ' obtido com Sucesso.');

                    const now4 = new Date();
                    const options4 = { timeZone: 'America/Sao_Paulo' };
                    const dateBr4 = now4.toLocaleString('pt-BR', options4);

                    console.log('\nEnviar XML de Liberação de Pendência do Pedido: ' + aux.order + '. ' + dateBr4);
    
                    const res = await sto.sendToOMXML(xml.xml);
    
                    if(res === `<?xml version='1.0' encoding='utf-8'?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Header/><soapenv:Body><somCommon:serviceOrderSyncResponse xmlns:somCommon="http://oi.com.br/som/common" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><code>0</code><description>Mensagem Recebida com Sucesso: Resposta para CRM</description></somCommon:serviceOrderSyncResponse></soapenv:Body></soapenv:Envelope>`){
                        
                        console.log('\nXML de Liberação de Pendência do Pedido: ' + aux.order + ' enviado com sucesso.\n\n');
                        
                        aux.status = 'pendencia enviada';
                        aux.messageIssue = 'Liberação de Pendência Enviada com Sucesso!'
                        aux.issueSendDate = new Date;

                        count++;

                        console.log('***************************************************************************************');

                    }else{

                        console.log('\nXML de Liberação de Pendência do Pedido: ' + aux.order + ' não enviado: ' + res.message + '\n\n');
                        
                        aux.status = 'erro';
                        aux.messageIssue = res.message;
                        aux.issueSendDate = new Date;

                        count++;

                        console.log('***************************************************************************************');

                    }
    
                }else{

                    console.log('\nErro ao criar o XML do Pedido: ' + aux.order + '.\n\n');

                    aux.status = 'error';
                    aux.messageIssue = 'Erro ao criar o XML!';
                    aux.issueSendDate = new Date;

                    count++;

                    console.log('***************************************************************************************');

                }

            }

            setTimeout(async () => {

                console.log('\nObter Números de BAs.\n');

                console.log('///////////////////////////////////////////////////////////////////////////////////////////');

                for(const a1 of a){

                    console.log('\nObter Número de BA do Pedido: ' + a1.order + '.');

                    const bas = await gban.getBANumber(a1.order);
                    
                    if(bas.status === 'success'){

                        console.log('\nNúmero de BA do Pedido ' + a1.order + ' é ' + bas.numberoba + '.\n');

                        a1.status = 'BA Capturado.';
                        a1.numberoba = bas.numberoba

                        console.log('///////////////////////////////////////////////////////////////////////////////////////////');

                    }else{

                        console.log('\nErro ao obter o Número de BA do Pedido ' + a1.order + '.\n');

                        a1.status = 'Erro ao obter BA.';
                        a1.numberoba = 0

                        console.log('///////////////////////////////////////////////////////////////////////////////////////////');

                    }

                }

                console.log('\nGerar Arquivo de Relatório.');

                let x = await gx.generateXLSX(a);

                console.log("\nArquivo Excel gerado com sucesso: " + x + '\n');

                console.log('///////////////////////////////////////////////////////////////////////////////////////////');

                if(count >= a.length){

                    console.log('\nAguardando Nova Pesquisa!\n')

                    setTimeout(() => {
                        this.closeAppointmentIssue();
                    }, 120000);

                }

            }, 120000);

        }else{

            console.log('\nAguardando Nova Pesquisa!\n')

            setTimeout(() => {
                this.closeAppointmentIssue();
            }, 120000);

        }
        
    }catch(err){

        console.log('\n\nErro ao executar chamada: ', err);

        console.log('///////////////////////////////////////////////////////////////////////////////////////////');

    }

};