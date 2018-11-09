({
	buildBatchStrings : function(component) {
		var action3 = component.get("c.buildBatchStrings");
        var trainingsParam = component.get("v.allBatches");       
        action3.setParams({"trainings" : trainingsParam});
        action3.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.allBatchLabels", response.getReturnValue());
                component.set("v.batchLabel", response.getReturnValue()[0]);
            }
        });
        $A.enqueueAction(actionBuildBatchString);
	},
    //get all available weeks for selected batch
    //default to all weeks
    getWeeksForBatch : function(component){
    	var actionGetBatchWeeks = component.get("c.batchWeeksStrings");
        var trainingParam = component.get("v.currentBatch");       
        actionGetBatchWeeks.setParams({"batch" : trainingParam});
        actionGetBatchWeeks.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.allWeekLabels", response.getReturnValue());
                component.set("v.weekLabel", "Week (All)");
            }
        });
        $A.enqueueAction(actionGetBatchWeeks);
	},
    //get all trainees for selected batch
    //default to all trainees
    getTraineesForBatch : function(component){
        var actionGetBatchTrainees = component.get("c.batchTrainees");
        var trainingParam = component.get("v.currentBatch");       
        actionGetBatchTrainees.setParams({"batch" : trainingParam});
        actionGetBatchTrainees.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.allTrainees", response.getReturnValue());
                component.set("v.currentTraineeName", "Trainee");
                component.set("v.currentTrainee", null);
                this.fireReportFilterChange(component);
            }
        });
        $A.enqueueAction(actionGetBatchTrainees);
    },
    //pull data for trainee selected from UI
    getSelectedTrainee : function(component, event){
        var actionGetTrainee = component.get("c.getSelectedTrainee");
        var trainingParam = component.get("v.allTrainees"); 
        var menuItemLabel = event.getSource().get("v.label");
        actionGetTrainee.setParams({"allTrainees" : trainingParam, "traineeName" : menuItemLabel});
        actionGetTrainee.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.currentTrainee", response.getReturnValue());
                component.set("v.currentTraineeName", response.getReturnValue().Name);
            	this.fireReportFilterChange(component);
            }
        });
        $A.enqueueAction(actionGetTrainee);
    },
    //set the newly chosen batch and get the weeks and trainees associated with it
    setCurrentBatch : function(component){
        var actionSetBatch = component.get("c.getSelectedBatch")
        var currentBatchLabel = component.get("v.batchLabel");
        var allBatches = component.get("v.allBatches");
        actionSetBatch.setParams({"batches" : allBatches, "batchName" : currentBatchLabel});
        actionSetBatch.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.currentBatch", response.getReturnValue());
                this.getWeeksForBatch(component);
        		this.getTraineesForBatch(component);
            }
        });
        $A.enqueueAction(actionSetBatch);
    },
    
    //fires event when any aspect of the report filter changes
    //if all weeks or all trainees is selected passes in -1 for them
    //if batch is null passes in -1
    fireReportFilterChange : function(component){
        var reportFilterEvent = $A.get("e.c:ReportFilterChange");
        var batch = component.get("v.currentBatch");
        var batchId = batch == null ? null : batch.Id;
        
        var allWeeks = component.get("v.allWeekLabels");
        var week = allWeeks.indexOf(component.get("v.weekLabel"));
        week = week == -1 ? null : week+1;
        
        var trainee = component.get("v.currentTrainee");
        var traineeId = trainee == null ? null : trainee.Id;
        reportFilterEvent.setParams({"batchId" : batchId, "week" : week, "traineeId" : traineeId});
        reportFilterEvent.fire();
    }
})