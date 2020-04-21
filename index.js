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
    let allow = true;
    for (let string in data) {
      if (typeof data[string] == 'string') {
        data[string] = sqlCheck.quotes(data[string]);
      } else {
        allow = false;
      }
    }
    if (allow) {
      connection.query(`INSERT INTO Canvas (DifferenceFromCompetitorsWindow,TheSolutionWeOffer,KeyResources,keyMetrics,ExpenditureStructure,ForNotes,TaskForce,ClientProblem,ClientTasks,HowToDecideNow,IncomeStream, name, status) values('${data.DifferenceFromCompetitorsWindow}', '${data.TheSolutionWeOffer}', '${data.KeyResources}', '${data.keyMetrics}', '${data.ExpenditureStructure}', '${data.ForNotes}', '${data.TaskForce}', '${data.ClientProblem}', '${data.ClientTasks}', '${data.HowToDecideNow}', '${data.IncomeStream}','${data.name}', '${data.status}')`, (err, data, fields)=> {
        if (err) {
          console.error(err);
          io.sockets.emit('saveDataStatus', {status: 0});
        } else {
          io.sockets.emit('saveDataStatus', {status: 1});
        }
      });
    } else {
      io.sockets.emit('saveDataStatus', {status: 0, data: 'badRequest'});
    }
  });

  socket.on('updateData', data => {
    let allow = true;
    for (let string in data) {
      if (typeof data[string] == 'string') {
        data[string] = sqlCheck.quotes(data[string]);
      } else {
        allow = false;
      }
    }
    if (allow) {
      if (!data.id) {
        console.log('new Canvas');
        connection.query(`INSERT INTO Canvas (${data.key}, status) values('${data.value}', 0)`, (err, data, fields)=> {
          if (err) {
            console.error(err);
            io.sockets.emit('updateDataStatus', {status: 0});
          } else {
            io.sockets.emit('updateDataStatus', {status: 1, id: data.insertId});
          }
        });
      } else {
        connection.query(`UPDATE Canvas SET ${data.key} = '${data.value}', status = 0 WHERE id = ${data.id}`, (err, data, fields)=> {
          if (err) {
            console.error(err);
            io.sockets.emit('updateDataStatus', {status: 0});
          } else {
            io.sockets.emit('updateDataStatus', {status: 1});
          }
        });
      }
    } else {
      io.sockets.emit('updateDataStatus', {status: 0, data: 'badRequest'});
    }
  });
});
io.listen(45705);

const sqlCheck = {
  quotes: function functionName(string) {
    let s = string.replace(/'/g, '');
    return s;
  }
};
