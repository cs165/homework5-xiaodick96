const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1GNAAA7q75SYg2xMQ94w1zxkMwx7_IO8pfafQTvpKEL0';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);
  
  const data = [];//save data to row,and print out 
  let data_row = {};
  
  for(let i=1; i < rows.length; i++ ){
	  data_row = {};
	  for(let j=0; j < rows[0].length; j++ ){
		  data_row[ rows[0][j] ] = rows[i][j];
	  }
	  data.push(data_row);
  }


  // TODO(you): Finish onGet.

  res.json(data);
}
app.get('/api', onGet);

async function onPost(req, res) {
  const messageBody = req.body;
  
  const result = await sheet.getRows();
  const rows = result.rows;
  
  var addPost = new Array();
  for(let i=0; i<rows[0].length;i++){
	  addPost[i] = messageBody[rows[0][i]];
  }
  const view=await sheet.appendRow(addPost);

  // TODO(you): Implement onPost.
  res.json({"response": "success"});
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;
  
  //find data which want to update or renew,after found it and replace it
  const result = await sheet.getRows();
  const rows = result.rows;
  let col_index, row_index;

  for(let i=0;i<rows[0].length;i++){
    if(rows[0][i].toLowerCase() == column.toLowerCase()){
      col_index = i;
      break;
    }
  }
  for(let j=1;j<rows.length;j++){
    if(rows[j][col_index] == value){
      row_index = j;
      break;
    }
  }
  let newRow = rows[row_index];
  for(let key in messageBody){
    newRow[rows[0].indexOf(key)] = messageBody[key];
  }
  await sheet.setRow(row_index,newRow);

  // TODO(you): Implement onPatch.

  res.json({"response": "success"});
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  
  const result = await sheet.getRows();
  const rows = result.rows;
  
  //compare data_delete and database
  let delete_row = -1;
  for(let i=0;i<rows.length;i++){
    const n = rows[0].length;
    for(let j=0;j<n;j++){
      if(column===rows[0][j]&&value===rows[i][j]){
        delete_row = i;
        break;
      }
    }
  }
  if(delete_row!==-1){
    await sheet.deleteRow(delete_row);
  }
  

  // TODO(you): Implement onDelete.

  res.json( { "response": "success"} );
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`CS193X: Server listening on port ${port}!`);
});
