var aCmd = $.request.parameters.get('cmd'); //get URL Paramter CMD

switch (aCmd) {
    
   
    
    case "retrieveMasterData":

        retrieveMasterData();

        break;
        
        case "retrieveDetailData":

        retrieveDetailData();

        break;
        
        case "retrieveDetailGPSPositions":

         retrieveDetailGPSPositions();

        break;
        

}


function retrieveMasterData() {

    var pstmt;
    var rs;
    var query;
    var output = {
        results: []
    };
    var singleRecord; 
    
    var resultList = [];

    var conn = $.db.getConnection();

    var maxCreated;
    var minCreated;
    var  maxOdometer;
    var minOdometer;
    var tripID;

    try {
        //Replace <schema> and <table> with your own schema and table!
        query = "SELECT Distinct C_TRIPID FROM \"<schema>\".\"<table>\" ";
        
        pstmt = conn.prepareStatement(query);
        rs = pstmt.executeQuery();
        var tripIds = [];
        var counter = 0;
        while (rs.next()) { 
           
            tripIds[counter] = "\'" + rs.getString(1) + "\'";
            counter++;
            }
        
        
        var i ;
        for (i = 0; i < tripIds.length; i++) { 
          
        //get minimum entry for tripID : minimum c_created
        
        //Replace <schema> and <table> with your own schema and table!
        query = "SELECT A.C_TRIPID,A.G_CREATED,A.C_Odometer FROM \"<schema>\".\"<table>\" As A where A.C_TRIPID = "+  tripIds[i]  + " AND" +
        " A.G_CREATED = (Select min(G_CREATED) FROM \"<schema>\".\"<table>\" where C_TRIPID = "+  tripIds[i] + ")" +
        " AND A.C_TRIPID = "+  tripIds[i] + " LIMIT 1";
        
         pstmt = conn.prepareStatement(query);
                rs = pstmt.executeQuery();
        
                
                while (rs.next()) {
                    var minOdometer;
                    singleRecord = {};
                    tripID = rs.getString(1);
                    minCreated = rs.getString(2);
                    minOdometer = rs.getString(3);
        
                }
        //maximum 
        
        //Replace <schema> and <table> with your own schema and table!
         query = "SELECT A.C_TRIPID,A.G_CREATED,A.C_Odometer FROM \"<schema>\".\"<table>\" As A where A.C_TRIPID = "+  tripIds[i]  + " AND" +
        " A.G_CREATED = (Select max(G_CREATED) FROM \"<schema>\".\"<table>\" where C_TRIPID = "+  tripIds[i] + ") AND A.C_TRIPID = "+  tripIds[i] + " LIMIT 1";
        
        pstmt = conn.prepareStatement(query);
                rs = pstmt.executeQuery();
        
                while (rs.next()) {
                    var minOdometer;
                    singleRecord = {};
                    maxCreated = rs.getString(2);
                    maxOdometer = rs.getString(3);
                }
        
        
                  //Calculate master data
       
                    var distance = maxOdometer - minOdometer;
                    singleRecord.C_TDISTANCE = parseFloat((maxOdometer - minOdometer).toString()).toFixed(2)  ;
                    singleRecord.C_TRIPID = tripID;
                   
                    //calc day from Timestamp
                    
                    var date = new Date(minCreated.split(' ').join('T'));
                    singleRecord.C_TRIPDAY = date.toLocaleDateString();
                    output.results.push(singleRecord);
        }
        rs.close();
        pstmt.close();
        conn.close();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
        return;
    }

    var body = JSON.stringify(output);
    $.response.contentType = 'application/json';
    $.response.headers.set('access-control-allow-origin','*');  
    $.response.setBody(body);
    $.response.status = $.net.http.OK;
};

function retrieveDetailGPSPositions() {
    var pstmt;
    var rs;
    var query;
    var output = {
        results: []
    };
    var singleRecord; 

    var conn = $.db.getConnection();

    var tripId = $.request.parameters.get('TRIPID');
    
    if (typeof tripId != 'undefined'){

    try {
        var tripID = "\'" + tripId + "\'";
        
         //Replace <schema> and <table> with your own schema and table!
        query = "SELECT C_GPSPOSITION FROM \"<schema>\".\"<table>\"  where C_TRIPID = "+  tripID ;
        
        
        pstmt = conn.prepareStatement(query);
        rs = pstmt.executeQuery();

        while (rs.next()) {
            var singleRecord ={};
            
            singleRecord.C_GPSPOSITION = rs.getString(1);
            output.results.push(singleRecord);
        
        }
        
        rs.close();
        pstmt.close();
        conn.close();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
        return;
    }

} else {
    
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody("Variable TRIPID has to be set for detail data. How should I get detail data without knowing which?");
        return;  
    
}
    var body = JSON.stringify(output);
    $.response.contentType = 'application/json';
     $.response.headers.set('access-control-allow-origin','*');  
    $.response.setBody(body);
    $.response.status = $.net.http.OK;
    
};

function retrieveDetailData() {

   
    var pstmt;
    var rs;
    var query;
    var singleRecord; 
    var maxFuelConsumed;
    var minFuelConsumed;
    var minCreated = 'undefined';
    var maxCreated = 'undefined';
    var minOdometer;
    var maxOdometer;
    var singleRecord ={};
    

    var conn = $.db.getConnection();

    var tripId = $.request.parameters.get('TRIPID');
    
    
    if (typeof tripId != 'undefined'){

    try {
        
        tripId = "\'" + tripId + "\'";
        
        
        //Execute jdbc request to get result sets for calculating Duration, Total Distance, Start Time, End Time, Fuel Consumed
        
        //Replace <schema> and <table> with your own schema and table!
        query = "SELECT A.G_CREATED,A.C_Odometer,A.C_FUELCONSUMED FROM \"<schema>\".\"<table>\" As A where A.C_TRIPID = "+  tripId  + " AND" +
        " A.G_CREATED = (Select min(G_CREATED) FROM \"<schema>\".\"<table>\" where C_TRIPID = "+  tripId + ")" +
        " AND A.C_TRIPID = "+  tripId + " LIMIT 1";
        
         pstmt = conn.prepareStatement(query);
                rs = pstmt.executeQuery();
        
                
                while (rs.next()) {
                     minCreated = rs.getString(1);
                     minOdometer = rs.getString(2);
                     minFuelConsumed = rs.getString(3);
                    
                }
        
        
        
        //maximum 
        //Replace <schema> and <table> with your own schema and table!
         query = "SELECT A.G_CREATED,A.C_Odometer,A.C_FUELCONSUMED FROM \"<schema>\".\"<table>\" As A where A.C_TRIPID = "+  tripId  + " AND" +
        " A.G_CREATED = (Select max(G_CREATED) FROM \"<schema>\".\"<table>\" where C_TRIPID = "+  tripId + ") AND A.C_TRIPID = "+  tripId + " LIMIT 1";
        
                 pstmt = conn.prepareStatement(query);
                rs = pstmt.executeQuery();
        
                while (rs.next()) {
                     maxCreated = rs.getString(1);
                     maxOdometer = rs.getString(2);
                     maxFuelConsumed = rs.getString(3);
                }
        
        
        if(maxCreated == 'undefined' || minCreated == 'undefined' ){
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
            $.response.setBody("TRIP ID: " +tripId + " could not be found" );
            return;
        }
        
        //calculate detail data  Duration, Total Distance, Start Time, End Time, Fuel Consumed
        
            
            singleRecord.C_TDISTANCE = parseFloat((maxOdometer - minOdometer).toString()).toFixed(2) ;
            
            
            //calc duration with difference beetween max and min
            
            var maxTime = new Date(maxCreated.split(' ').join('T'));
            var minTime     = new Date(minCreated.split(' ').join('T'));
            
            //singleRecord.C_DURATION = Math.abs(maxTime - minTime) / 36e5;
            
            var diffHrs = Math.floor(((maxTime - minTime) % 86400000) / 3600000);
            var diffMins = Math.floor((((maxTime - minTime) % 86400000) % 3600000) / 60000);
            
            if (diffMins < 10) {
                singleRecord.C_DURATION = diffHrs + ":0"+ diffMins;
            } else{
                singleRecord.C_DURATION = diffHrs + ":"+ diffMins;
            }
           
            singleRecord.C_STARTTIME = formatAMPM(minTime);
            singleRecord.C_ENDTIME = formatAMPM(maxTime);
            singleRecord.C_FUELCONSUMED = parseFloat((maxFuelConsumed - minFuelConsumed).toString()).toFixed(2);
            
     
        //Calculate  Avg Speed,Acc,Gear
       
        //Replace <schema> and <table> with your own schema and table!
        query = "SELECT AVG(C_SPEED), AVG(C_ACCELERATION), AVG(C_GEAR) FROM \"<schema>\".\"<table>\"  where C_TRIPID = "+  tripId ;
        
        
        pstmt = conn.prepareStatement(query);
        rs = pstmt.executeQuery();

        
        
        while (rs.next()) {
        singleRecord.C_AVGSPEED = parseFloat(rs.getString(1)).toFixed(2)  ; 
        singleRecord.C_AVGACCELERATION = parseFloat(rs.getString(2)).toFixed(2) ;
        singleRecord.C_GEAR = parseFloat(rs.getString(3)).toFixed(2) ;
           
        }
 
       //Calculate Avg SpeedTotal,Acc,Gear
       
       //Replace <schema> and <table> with your own schema and table!
       query = "SELECT AVG(C_SPEED), AVG(C_ACCELERATION), AVG(C_GEAR) FROM \"<schema>\".\"<table>\" " ;
        
        
        pstmt = conn.prepareStatement(query);
        rs = pstmt.executeQuery();
        
       while (rs.next()) {
           
        singleRecord.C_TAVGSPEED = parseFloat(rs.getString(1)).toFixed(2) 
        singleRecord.C_TAVGACCELERATION = parseFloat(rs.getString(2)).toFixed(2)
        singleRecord.C_TGEAR = parseFloat(rs.getString(3)).toFixed(2); ;
        }
       
        rs.close();
        pstmt.close();
        conn.close();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
        return;
    }

} else {
    
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody("Variable TRIPID has to be set for detail data. How should I get detail data without knowing which?");
        return;  
    
}
    var body = JSON.stringify(singleRecord);
    $.response.contentType = 'application/json';
     $.response.headers.set('access-control-allow-origin','*');  
    $.response.setBody(body);
    $.response.status = $.net.http.OK;
}



function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}