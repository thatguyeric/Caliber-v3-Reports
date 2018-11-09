({
	buildBatchStrings : function(component) {
		var action3 = component.get("c.buildBatchStrings");
        var trainingsParam = component.get("v.allBatches");       
        action3.setParams({"trainings" : trainingsParam});
        action3.setCallback(this, function(response){
            var state = response.getState();
            var allBatches = [];
            if (state === "SUCCESS"){
                response.getReturnValue().forEach(function(element){
                    var batch = {
                        "label" : element,
                        "value" : element,
                    }
                    allBatches.push(batch);
                });
                component.set("v.allBatchLabels", allBatches);
                component.set("v.batchLabel", allBatches[0].label);
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
            var allWeeks = [];
            if (state === "SUCCESS"){
                response.getReturnValue().forEach(function(element){
                    var week = {
                        "label" : element,
                        "value" : element,
                    }
                    allWeeks.push(week);
                });
                component.set("v.allWeekLabels", allWeeks);
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
            var trainees = [];
            if (state === "SUCCESS"){
                var trainee = {"label":"Trainee", "value": null};
                trainees.push(trainee);
                response.getReturnValue().forEach(function(element){
                    trainee = {
                        "label" : element.Name,
                        "value" : element.Id,
                    }
                    trainees.push(trainee);
                });
                component.set("v.allTrainees", trainees);
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
        var trainingContacts = [];
        var menuItemLabel = event.getSource().get("v.value");
        for (var i = 0; i < trainingParam.length; i++){
            trainingContacts.push(trainingParam[i].value);
            if (trainingParam[i].value == menuItemLabel){
                menuItemLabel = trainingParam[i].label;
            }
        }
        actionGetTrainee.setParams({"allTraineeIds" : trainingContacts, "traineeName" : menuItemLabel});
        actionGetTrainee.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.currentTrainee", response.getReturnValue());
                if (response.getReturnValue() != null){
                	component.set("v.currentTraineeName", response.getReturnValue().Name);
                }else{
                    component.set("v.currentTraineeName", "Trainee");
                }
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
        
        var week = component.get("v.weekLabel");
        var index = parseInt(week.substr(week.length - 1));
        var week = index;
        week = week == -1 ? null : week;
        
        var trainee = component.get("v.currentTrainee");
        var traineeId = trainee == null ? null : trainee.Id;
        console.log("batchId: " + batchId + " week: " + week + " traineeId: " + traineeId);
        reportFilterEvent.setParams({"batchId" : batchId, "week" : week, "traineeId" : traineeId});
        reportFilterEvent.fire();
    }
})