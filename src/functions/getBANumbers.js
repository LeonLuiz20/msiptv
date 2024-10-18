const oracledb = require('oracledb');

module.exports.getBANumber = async function(solicitation) {

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
            `SELECT AM.NUMEROBA FROM OSMORDER.TBI_ORDEM_SERVICO OS, OSMORDER.TBI_ATIVIDADE_MANUAL AM WHERE OS.CWORDERID = AM.CWORDERID AND OS.NUM_PEDIDO = :solicitation AND AM.STATUS_ATIVIDADE = 0`,
            {solicitation: solicitation},
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        if(result.rows.length > 0){
                
            const row = result.rows[0];

            let b = {
                status: 'success',
                numberoba: row.NUMEROBA
            };

            return b;

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

}