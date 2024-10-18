const oracledb = require('oracledb');

module.exports.getSolicitationWith7029 = async function() {

    let poolSW = await oracledb.createPool({
        user: `${process.env.BDUSER}`,
        password: `${process.env.BDPASS}`,
        connectString: `${process.env.BDHOST}:${process.env.BDPORT}/${process.env.BDSERVICE}`,
        poolMin: 15,
        poolMax: 20,
        poolIncrement: 1
    });

    try {

        poolSW = await oracledb.getConnection();

        const result = await poolSW.execute(
            `SELECT OS.NUM_PEDIDO
            FROM OSMORDER.TBI_ORDEM_SERVICO OS,
            OSMORDER.CWPROCESS P
            WHERE OS.CWORDERID = P.ORDER_ID
            AND P.STATUS = 1
            AND P.PARENT_ID = 0
            AND OS.DESC_ESTADO_ORDEM_SERVICO = 'Em processamento'
            AND OS.DESC_ESTADO_TRAMITACAO = 'Em tratamento de pendência'
            AND OS.CODPENDENCIA = '7029'
            AND OS.TP_ORDEM_SERVICO = 'TIPO_ORDEM_MODIFICACAO'
            AND OS.AGREG_SOLICITACAO LIKE '%Mudança de Pacote%'
            AND OS.CWORDERID = (SELECT AUX.CWORDERID
                                FROM OSMORDER.TBI_PRODUTO AUX
                                WHERE AUX.NOME_PACOTE = 'Triple Play Fibra'
                                AND AUX.FLAGISORIGINAL = 'O'
                                AND OS.CWORDERID = AUX.CWORDERID)
            AND OS.CWORDERID = (SELECT AUX.CWORDERID
                                FROM OSMORDER.TBI_PRODUTO AUX
                                WHERE AUX.NOME_PACOTE = 'Dual Play Fibra BL + VoIP'
                                AND AUX.FLAGISORIGINAL = 'N'
                                AND OS.CWORDERID = AUX.CWORDERID)
            AND P.CREATION_DATE >= SYSDATE - 1
            FETCH FIRST 1000 ROWS ONLY`
        );

        if(result.rows.length > 0){
            
            const row = result.rows;

            let r = {
                qt: row.length,
                solicitations: row
            };

            return r;

        }else{

            console.log('\nSW: Nenhuma linha encontrada!');

            let r = {
                qt: 0
            };

            return r;

        }

    }catch(err){

        res.status(500).send('Erro ao conectar no banco de dados');

    }finally{

        if(poolSW) {
            try {
                await poolSW.close();
            }catch(err){
                console.error(err);
            }
        }

    }

};