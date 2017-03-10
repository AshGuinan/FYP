// for grabbing playground info from http://galwaycoco.maps.arcgis.com/home/item.html?id=d5d7885b049d489fa9b8e5339488c1df#data
var data = [];
var columns = [];
var type, value;
var rows = document.querySelectorAll('tr');
// loop over rows, skip 0 as it is the header
for(var i = 1; i < rows.length; i++){
	// get every column in the row
	columns = rows[i].querySelectorAll('td');
	data[i-1] = {};
	for(var j = 1; j < columns.length; j++){
		// the datatype is in a  css classname - so extract it
		type = columns[j].className.match(/field-(\w+)/)[1];
		// value is inside a div in the column
		value =  columns[j].querySelector('div').innerHTML;
		data[i-1][type] = value;
	}
}


console.log(JSON.stringify(data));