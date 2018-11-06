({
    //todo: update all batches based on year, all weeks based on batch
    //all trainees based on batch
    
    //todo: split doInitYears into multiple init functions?
    //initialize years, batches, weeks, and trainees
    doInitYears : function(component, event, helper){
        var action = component.get("c.GetAllYearsWithBatches");
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.allYears", response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
        
        var action2 = component.get("c.getBatchesByYear");
        var yearParam = component.get("v.yearLabel");
        action2.setParams({"year" : yearParam});
        action2.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.allBatches", response.getReturnValue());
                helper.buildBatchStrings(component);
            }
        });
        $A.enqueueAction(action2);
    },
    
	updateYearLabel : function(component, event, helper) {
		var menuItemLabel = event.getSource().get("v.label"); 
        component.set("v.yearLabel", menuItemLabel);
	},
    
    updateBatchLabel : function(component, event, helper) {
    	var menuItemLabel = event.getSource().get("v.label"); 
        component.set("v.batchLabel", menuItemLabel);
	},
    
    updateWeekLabel : function(component, event, helper) {
    	var menuItemLabel = event.getSource().get("v.label"); 
        component.set("v.weekLabel", menuItemLabel);
	},
    
    updateTraineeLabel : function(component, event, helper) {
    	var menuItemLabel = event.getSource().get("v.label");
        component.set("v.currentTrainee", menuItemLabel);
	}
 })