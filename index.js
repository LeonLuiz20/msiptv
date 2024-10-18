const dotenv = require('dotenv');

dotenv.config();

const now = new Date();
const options = { timeZone: 'America/Sao_Paulo' };
const dateBr = now.toLocaleString('pt-BR', options);
console.log('\nStart Microservices IPTV: ' + dateBr + '.');

const now1 = new Date();
const options1 = { timeZone: 'America/Sao_Paulo' };
const dateBr1 = now1.toLocaleString('pt-BR', options1);
console.log('Get Solicitations: ' + dateBr1 + '.\n');
const p_cai = require('./src/processors/p_closeAppointmentIssue');

p_cai.closeAppointmentIssue();