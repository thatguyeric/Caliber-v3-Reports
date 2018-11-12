({
    getAllYears : function(component){
        var action = component.get("c.GetAllYearsWithBatches");
        action.setCallback(this, function(response){
            var state = response.getState();
            var allYears = [];
            if (state === "SUCCESS"){
                response.getReturnValue().forEach(function(element){
                    var year = {
                        "label" : element.toString(),
                        "value" : element,
                    }
                    allYears.push(year);
                });
                component.set("v.allYears", allYears);
                component.set("v.yearLabel", allYears[0].value);
                component.find("selectYear").set("v.value", component.get("v.yearLabel"));
                this.getBatchesForYear(component);
            }
        });
        $A.enqueueAction(action);
    },
    
    getBatchesForYear : function(component){
        var action2 = component.get("c.getBatchesByYear");
        var yearParam = component.get("v.yearLabel");
        action2.setParams({"year" : yearParam});
        action2.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.allBatches", response.getReturnValue());
                component.set("v.currentBatch", response.getReturnValue()[0]);
                this.buildBatchStrings(component);
            }
        });
        $A.enqueueAction(action2);
    },
    
	buildBatchStrings : function(component) {
		var actionBuildBatchString = component.get("c.buildBatchStrings");
        var trainingsParam = component.get("v.allBatches");       
        actionBuildBatchString.setParams({"trainings" : trainingsParam});
        actionBuildBatchString.setCallback(this, function(response){
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
                component.find("selectBatch").set("v.value", component.get("v.batchLabel"));
                this.setCurrentBatch(component);
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
                component.find("selectWeek").set("v.value", component.get("v.weekLabel"));
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
                var trainee = {"label":"All", "value": null};
                trainees.push(trainee);
                response.getReturnValue().forEach(function(element){
                    trainee = {
                        "label" : element.Name,
                        "value" : element,
                    }
                    trainees.push(trainee);
                });
                component.set("v.allTrainees", trainees);
                component.set("v.currentTraineeName", trainees[0].label);
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
        for (var i = 1; i < trainingParam.length; i++){
            trainingContacts.push(trainingParam[i].value.Id);
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
    //if all weeks or all trainees is selected passes in nan or null for them
    //if batch is null passes in null
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
        //console.log("batchId: " + batchId + " week: " + week + " traineeId: " + traineeId);
        
        //TODO: future sprint
        //until the functionality is implemented for week and trainee filtering we are setting
        //week and trainee to null so that none of the reports try to query the apex controller
        //for week or trainee filtering reports
        reportFilterEvent.setParams({"batchId" : batchId, "week" : null, "traineeId" : null});
        reportFilterEvent.fire();
    }
})