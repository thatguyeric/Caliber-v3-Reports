({
    /* This method updates the report when the filters change */
	handleReportFilterChange : function(component, event, helper) {
		var batchId = event.getParam('batchId');
        var week = event.getParam('week');
        var traineeId = event.getParam('traineeId');
        
        console.log('ReportBatchOverallTechSkillsRadar: Filters changed to:' +
                    ' batchId=' + batchId +
                    ' week=' + week +
                    ' traineeId=' + traineeId);
        
        // only show and update chart if it should be visible
        if (batchId && !week && !traineeId ||
            batchId && !week && traineeId ||
            batchId && week && traineeId) {
            // make sure the report is visible
            $A.util.removeClass(component.find('reportPanel'), 'hidden');
            // send a request to the server
            // if scripts are not loaded yet, do server request after scripts are done loading
            if (component.get('v.isScriptsLoaded')) {
            	helper.doServerRequest(component, helper, batchId, week, traineeId);
            } else {
                component.set('v.eventParamsReportFilterChange', {
                    batchId: batchId,
                    week: week,
                    traineeId: traineeId
                });
            }
        } else {
            // hide the component since it is not used with the current filter
            $A.util.addClass(component.find('reportPanel'), 'hidden');
        }
	},
    handleScriptsLoaded : function(component, event, helper) {
        component.set('v.isScriptsLoaded', true);
        // do server request if chart.js was not done loading
        var params = component.get('v.eventParamsReportFilterChange');
        if (params) {
            helper.doServerRequest(component, helper, params.batchId, params.week, params.traineeId);
        }
        
        //TODO: remove when done testing
        helper.testServerRequest(component, helper);
    },
    /* Update the chart when the selected trainees change */
    updateShownTraineeIndexesList : function(component, event, helper) {
        component.set('v.shownTraineesValue', event.getParam('value'));
        helper.createChart(component, helper);
    },
    /* Used for testing */
    test : function(component, event, helper) {
        $A.util.removeClass(component.find('reportPanel'), 'hidden');
        helper.testServerRequest(component, helper);
    }
})