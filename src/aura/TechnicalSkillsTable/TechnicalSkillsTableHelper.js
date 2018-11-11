({
        getCurrentBatch : function(component, event, helper) {
        var batchId = event.getParam('batchId');
        var actionGetBatch = component.get('c.getCurrentBatch');
        actionGetBatch.setParams({'batchId' :batchId});
        actionGetBatch.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set('v.currentBatch', response.getReturnValue());
                //console.log(response.getReturnValue());
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " +
                                    errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            
        });
        $A.enqueueAction(actionGetBatch);
    },
    
    getBatchCat : function(component, event, helper) {
        var batchId = event.getParam('batchId');
        var action = component.get('c.getCalCat');
        action.setParams({'batchId' :batchId});
        
        // Create a callback that is executed after
        // the server-side action returns
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set('v.category', response.getReturnValue());
                console.log(response.getReturnValue());
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " +
                                    errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        
        $A.enqueueAction(action);
    }
    

})