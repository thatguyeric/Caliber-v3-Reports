({
	handleReportFilterChange : function(component, event, helper) {
		var batchId = event.getParam('batchId');
        var week = event.getParam('week');
        var traineeId = event.getParam('traineeId');
        
        if (batchId && !week && !traineeId ||
            batchId && !week && traineeId ||
            batchId && week && traineeId) {
            // make sure that the canvas is loaded before the chart is updated
            component.set('v.isVisible', true);
            // schedule a report update on next render
            component.set('v.isReportNeedUpdate', true);
            component.set('v.serverResponseData', null);
        } else {
            component.set('v.isVisible', false);
        }
	},
    handleScriptsLoaded : function(component, event, helper) {
        component.set('v.isScriptsLoaded', true);
    },
    handleRender : function(component, event, helper) {
        if (component.get('v.isScriptsLoaded') && component.get('v.isReportNeedUpdate')) {
            // avoid infinite loop
            component.set('v.isReportNeedUpdate', false);
            // only do server request if necessary
            var serverResponseData = component.get('v.serverResponseData');
            if (serverResponseData) {
                // changing shown trainees, so don't need a server request
                helper.createChart(component, helper, serverResponseData);
            } else {
                //helper.doServerRequest(component, helper, batchId, week, traineeId);
                helper.test(component, helper);
            }
        }
    },
    updateShownTraineeIndexesList : function(component, event, helper) {
        component.set('v.shownTraineesValue', event.getParam('value'));
        component.set('v.isReportNeedUpdate', true);
    },
    test : function(component, event, helper) {
        component.set('v.isVisible', true);
        component.set('v.isReportNeedUpdate', true);
        component.set('v.serverResponseData', null);
    }
})