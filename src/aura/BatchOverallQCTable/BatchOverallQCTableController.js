({
    doInit : function(component, event, helper) {
        var action = component.get('c.getBatchOverallQCTable');
        var batchIDParam = event.getParam('batchId');
        action.setParams({"batchID": batchIDParam})
        //set up the callback
        action.setCallback(this, function(actionResult){
            var state = actionResult.getState();
            if (state ==="SUCCESS"){
                var result = actionResult.getReturnValue();
                var obj = JSON.parse(result);
                console.log(obj);
                var weeks = helper.getWeeks(obj);
                component.set("v.weekNums", weeks);
                component.set("v.trainees", obj.trainees);
                component.set("v.batch",obj.batchWeeklyData);
                component.set("v.batchName", obj.batchName);
            }
        });  
        
        $A.enqueueAction(action);        
    },
    
    getSmiley : function(component, event, helper){
        
    }
})