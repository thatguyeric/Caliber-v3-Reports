({
    
    //todo: split doInitYears into multiple init functions?
    //initialize years, batches, weeks, and trainees
    doInitYears : function(component, event, helper){
        helper.getAllYears(component, event);
    },
    
	updateYearLabel : function(component, event, helper) {
		var menuItemLabel = event.getSource().get("v.value"); 
        component.set("v.yearLabel", menuItemLabel);
        helper.getBatchesForYear(component);
	},
    
    updateBatchLabel : function(component, event, helper) {
    	var menuItemLabel = event.getSource().get("v.value"); 
        component.set("v.batchLabel", menuItemLabel);
        helper.setCurrentBatch(component);
	},
    
    updateWeekLabel : function(component, event, helper) {
    	var menuItemLabel = event.getSource().get("v.value");
        component.set("v.weekLabel", menuItemLabel);
        helper.fireReportFilterChange(component);
	},
    
    updateTraineeLabel : function(component, event, helper) {
    	var menuItemLabel = event.getSource().get("v.value");
        component.set("v.currentTrainee", menuItemLabel);
        helper.getSelectedTrainee(component, event);
	}
 })