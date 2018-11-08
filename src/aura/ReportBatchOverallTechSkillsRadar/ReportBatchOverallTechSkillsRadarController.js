({
	handleReportFilterChange : function(component, event, helper) {
		var batchId = event.getParam('batchId');
        var week = event.getParam('week');
        var traineeId = event.getParam('traineeId');
        
        console.log('ReportBatchOverallTechSkillsRadar: Filters changed to:' +
                    ' batchId=' + batchId +
                    ' week=' + week +
                    ' traineeId=' + traineeId);
        
        if (batchId && !week && !traineeId ||
            batchId && !week && traineeId ||
            batchId && week && traineeId) {
            // make sure the report is visible
            $A.util.removeClass(component.find('reportContentContainer'), 'hidden');
            helper.doServerRequest(component, helper, batchId, week, traineeId);
        } else {
            $A.util.addClass(component.find('reportContentContainer'), 'hidden');
        }
	},
    handleScriptsLoaded : function(component, event, helper) {
        component.set('v.isScriptsLoaded', true);
    },
    handleRender : function(component, event, helper) {
        if (component.get('v.isScriptsLoaded') && component.get('v.isChartNeedRender')) {
            console.log('ReportBatchOverallTechSkillsRadar: creating chart on render');
            component.set('v.isChartNeedRender', false);
            helper.createChart(component, helper);
        }
    },
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
    updateShownTraineeIndexesList : function(component, event, helper) {
        component.set('v.shownTraineesValue', event.getParam('value'));
        helper.createChart(component, helper);
    },
    test : function(component, event, helper) {
        $A.util.removeClass(component.find('reportContentContainer'), 'hidden');
        helper.testServerRequest(component, helper);
    }
})