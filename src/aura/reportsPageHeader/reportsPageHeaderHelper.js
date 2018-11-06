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
        $A.enqueueAction(action3);
	}
})