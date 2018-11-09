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
            $A.util.removeClass(component.find('reportContentContainer'), 'hidden');
            // send a request to the server
            helper.doServerRequest(component, helper, batchId, week, traineeId);
        } else {
            // hide the component since it is not used with the current filter
            $A.util.addClass(component.find('reportContentContainer'), 'hidden');
        }
	},
    handleScriptsLoaded : function(component, event, helper) {
        component.set('v.isScriptsLoaded', true);
    },
    /* Used in a hack to handle receiving the
     * server response before chart.js is done loading.
     */
    handleRender : function(component, event, helper) {
        // render event will be fired after this method exits,
        // so make sure to avoid an infinite loop
        if (component.get('v.isScriptsLoaded') && component.get('v.isChartNeedRender')) {
            console.log('ReportBatchOverallTechSkillsRadar: creating chart on render');
            component.set('v.isChartNeedRender', false);
            helper.createChart(component, helper);
        }
    },
    /* Create the chart when the server response data is ready */
    handleServerResponseDataChange : function(component, event, helper) {
        // scripts might not be done loading yet
        if (component.get('v.isScriptsLoaded')) {
            helper.createChart(component, helper);
        } else {
            component.set('v.isChartNeedRender', true);
            console.log('ReportBatchOverallTechSkillsRadar: ' +
                        'received response from server before chart.js finished loading');
            //component.set('v.errorMsg', 'Error creating chart. Set a filter to create chart.');
        }
    },
    /* Update the chart when the selected trainees change */
    updateShownTraineeIndexesList : function(component, event, helper) {
        component.set('v.shownTraineesValue', event.getParam('value'));
        helper.createChart(component, helper);
    },
    /* Used for testing */
    test : function(component, event, helper) {
        $A.util.removeClass(component.find('reportContentContainer'), 'hidden');
        helper.testServerRequest(component, helper);
    }
})