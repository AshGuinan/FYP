var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');


function scrapeGalwayCoCo(){
    // url = 'http://galwaycoco.maps.arcgis.com/home/item.html?id=d5d7885b049d489fa9b8e5339488c1df#data';
    // We can get the data straight in JSON data from this url:
    url = "http://services1.arcgis.com/mJI7JYqAOKXPG7Hh/arcgis/rest/services/"+
          "Playgrounds_County_Galway/FeatureServer/0/query?f=json&where=1%3D1"+
          "&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields"+
          "=*&orderByFields=FID%20ASC&resultOffset=0&resultRecordCount=100";
    request(url, function(error, response, json) {
        if (!error) {
            console.log(json);
            var data = JSON.parse(json);

            // save data
            fs.writeFile('galway_playgrouds.json', JSON.stringify(data, null, 4), function(err){
                console.log('galway_playgrounds.json was saved');
            })

        }
    })
}

scrapeGalwayCoCo();