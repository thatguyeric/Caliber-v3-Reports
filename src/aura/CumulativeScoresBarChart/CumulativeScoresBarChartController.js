({
    cumulativeScoresBar : function(component, event, helper) {
        var batchId = event.getParam("batchId");
        var week = event.getParam("week");
        var traineeId = event.getParam("traineeId");
        if(batchId && !week && !traineeId || 
           batchId && week && !traineeId){
            helper.doServerRequest(component, batchId, week);
        }
    },
    
    renderChart : function(component, event, helper) {
        helper.renderChart(component);
    },
    
    test : function(component, event, helper){
        helper.test(component, helper);
    }
})