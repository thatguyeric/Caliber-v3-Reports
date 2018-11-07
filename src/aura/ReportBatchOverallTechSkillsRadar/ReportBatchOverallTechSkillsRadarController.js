({
	handleReportFilterChange : function(component, event, helper) {
		var batchId = event.getParam('batchId');
        var week = event.getParam('week');
        var traineeId = event.getParam('traineeId');
        
        if (batchId && !week && !traineeId ||
            batchId && !week && traineeId ||
            batchId && week && traineeId) {
            component.set('v.isVisible', true);
            helper.doServerRequest(component, helper, batchId, week, traineeId);
        } else {
            component.set('v.isVisible', false);
        }
	},
    updateShownTraineeIndexesList : function(component, event, helper) {
        //TODO
    },
    renderChart : function(component, event, helper) {
        helper.renderChart(component);
    },
    test : function(component, event, helper) {
        helper.test(component, helper);
    }
})