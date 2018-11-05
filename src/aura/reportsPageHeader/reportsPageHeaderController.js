({
    //todo: update all batches based on year, all weeks based on batch
    //all trainees based on batch
    
    //initialize years, batches, weeks, and trainees
    doInit : function(component, event, helper){
        var action = component.get("c.GetAllYearsWithBatches");
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.allYears", response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    },
    
	updateYearLabel : function(component, event, helper) {
		var menuItemLabel = event.getSource().get("v.label"); 
        component.set("v.yearLabel", menuItemLabel);
	},
    
    updateBatchLabel : function(component, event, helper) {
    	var menuItemLabel = event.getSource().get("v.label"); 
	},
    
    updateWeekLabel : function(component, event, helper) {
    	var menuItemLabel = event.getSource().get("v.label"); 
	},
    
    updateTraineeLabel : function(component, event, helper) {
    	var menuItemLabel = event.getSource().get("v.label"); 
	}
 })