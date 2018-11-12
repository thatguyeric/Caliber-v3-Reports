({
    weeklyProgressChart : function(component, event, helper) {
        
        var batchId = event.getParam("batchId");
        var week = event.getParam("week");
        var traineeId = event.getParam("traineeId");
        //check if values are valid
        if(batchId && !week && !traineeId || 
           batchId && week && !traineeId){
            //check if chart.js has been loaded
            if(component.get("v.chartState")){   
                //do server request
                helper.doServerRequest(component, helper, batchId, traineeId, week);       
            }else{
                //storing values if Chart.js has not loaded
                component.set("v.batch", event.getParam("batchId"));
                component.set("v.trainee", event.getParam("traineeId"));
                component.set("v.week", event.getParam("week"));
            }
        }
        
    },
    
    handleScriptsLoaded : function(component, event, helper){
        //set chart loaded attribute
        component.set("v.chartState", true);
        //get stored values
        var batch = component.get("v.batch");
        var trainee = component.get("v.trainee");
        var week = component.get("v.week");
        //check if values are set
        if(batch && trainee || week){
            //do server request
            helper.doServerRequest(component, helper, batchId, traineeId, week);
            //clear attributes
            component.set("v.batch", null);
            component.set("v.trainee", null);
            component.set("v.week", null);           
        }       
    }
})