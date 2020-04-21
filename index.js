const io = require('socket.io')();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'kEEgyoiRmsHaw1A',
  database: 'Canvas'
});
let iocon = 0;

io.on('connection', socket => {
  iocon++;
  console.info(`${iocon} io active`);

  socket.on('disconnect', ()=> {
    iocon--;
  });

  socket.on('getData', () => {
    connection.query('SELECT * FROM Canvas', (err, data, fields)=> {
      io.sockets.emit('allData', data);
    });
  });

  socket.on('saveData', data => {
    connection.query(`INSERT INTO Canvas (DifferenceFromCompetitorsWindow,TheSolutionWeOffer,KeyResources,keyMetrics,ExpenditureStructure,ForNotes,TaskForce,ClientProblem,ClientTasks,HowToDecideNow,IncomeStream, name) values('${data.DifferenceFromCompetitorsWindow}', '${data.TheSolutionWeOffer}', '${data.KeyResources}', '${data.keyMetrics}', '${data.ExpenditureStructure}', '${data.ForNotes}', '${data.TaskForce}', '${data.ClientProblem}', '${data.ClientTasks}', '${data.HowToDecideNow}', '${data.IncomeStream}','${data.name}')`, (err, data, fields)=> {
      if (err) {
        console.error(err);
        io.sockets.emit('saveDataStatus', {status: 0});
      } else {
        io.sockets.emit('saveDataStatus', {status: 1});
      }
    });
  });

  socket.on('updateData', data => {
    connection.query(`UPDATE Canvas SET ${data.key} = '${data.value}' WHERE id = ${data.id}`, (err, data, fields)=> {
      if (err) {
        console.error(err);
        io.sockets.emit('updateDataStatus', {status: 0});
      } else {
        io.sockets.emit('updateDataStatus', {status: 1});
      }
    });
  });
});
io.listen(45705);
