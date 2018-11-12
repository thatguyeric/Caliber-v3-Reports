({
    cumulativeScoresBar : function(component, event, helper) {
        //get parameters
        var batchId = event.getParam("batchId");
        var week = event.getParam("week");
        var traineeId = event.getParam("traineeId");
        
        //check if values are correct
        if(batchId && !week && !traineeId || 
           batchId && week && !traineeId){
            if(component.get("v.chartState")){   
                //do server request
                helper.doServerRequest(component, helper, batchId, week);       
            }else{
                //storing values if Chart.js has not loaded
                component.set("v.batch", event.getParam("batchId"));
                component.set("v.trainee", event.getParam("traineeId"));
                component.set("v.week", event.getParam("week"));
            }
        }
        
        
    },
    
    handleScriptsLoaded : function(component, event, helper){
        //set loading chart attribute to true
        component.set("v.chartState", true);
        //get stored values
        var batch = component.get("v.batch");
        var trainee = component.get("v.trainee");
        var week = component.get("v.week");
        //do Server request if values are valid
        if(batch && trainee || week){
             helper.doServerRequest(component, helper, batchId, week);
        }     
        //clear attributes
        component.set("v.batch", null);
        component.set("v.trainee", null);
        component.set("v.week", null);
        
    }
})