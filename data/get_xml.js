const xml2js = require('xml2js');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "ATTR" });

// this example reads the file synchronously
// you can read it asynchronously also
// let xml_string = fs.readFileSync("resources/170114-Schwandorf-ME.lef", "utf8");
let xml_string = fs.readFileSync("resources/190706_Export_Meldungen.lef", "utf8");

//const events = result.LENEX.MEETS[0].MEET[0].SESSIONS[0].SESSION[0].EVENTS[0]

parser.parseString(xml_string, function(error, result) {
    if(error === null) {
        var events = result.LENEX.MEETS[0].MEET[0].SESSIONS[0].SESSION[0].EVENTS[0];
        console.log(result.LENEX.MEETS[0].MEET[0].ATTR);
        console.log("---------------")
        console.log(events);
    }
    else {
        console.log(error);
    }
});

parseData(xml_string);

function parseData(html){
    const {JSDOM} = jsdom;
    const dom = new JSDOM(html);
    const $ = (require('jquery'))(dom.window);   
    
    //let's start extracting the data
    var items = $(".list_item");
    console.log("read ..")
    console.log(items.length)
    console.log($)

      for(var i = 0; i < items.length; i++){
    
        //var innerInfo = $(items[i]).children('.info');
        //var movieName = $($(innerInfo).find('a')[0]).html();
        //var movieYear = $($(innerInfo).find('.year_type')[0]).html();
        console.log(i + " -> " + $(items[i]));
      }
}