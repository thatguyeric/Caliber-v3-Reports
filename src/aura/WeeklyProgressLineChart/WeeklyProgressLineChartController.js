({
    weeklyProgressChart : function(component, event, helper) {
        //check if chart.js has been loaded
        if(component.get("v.chartState")){
            var batchId = event.getParam("batchId");
            var week = event.getParam("week");
            var traineeId = event.getParam("traineeId");
            helper.doServerRequest(component, helper, batchId, traineeId, week);
        }
        
    },
    
    initialChart : function(component, event, helper){
        component.set("v.chartState", true);
    }
})