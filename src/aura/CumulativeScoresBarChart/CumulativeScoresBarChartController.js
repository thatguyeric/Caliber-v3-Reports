({
    cumulativeScoresBar : function(component, event, helper) {
        if(component.get("v.chartState")){
            var batchId = event.getParam("batchId");
            var week = event.getParam("week");
            var traineeId = event.getParam("traineeId");
            if(batchId && !week && !traineeId || 
               batchId && week && !traineeId){
                helper.doServerRequest(component, helper, batchId, week);
            }
        }
        
    },
    
    renderChart : function(component, event, helper) {
        helper.renderChart(component);
    },
    
    test : function(component, event, helper){
        component.set("v.chartState", true);
    }
})