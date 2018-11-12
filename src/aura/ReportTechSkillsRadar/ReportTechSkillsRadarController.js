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
    },
    onModalOpen : function(component, event, helper) {
        /* Set the checked values for the checkboxes.
         * If the aura:iteration with lightning:input is replaced with
         * lightning:checkboxGroup, then this code can be removed
         */
        var shownTraineesValue = component.get('v.shownTraineesValue');
        component.find('trainee-checkbox').forEach(function(checkbox) {
            var checkboxValue = checkbox.get('v.value');
            if (shownTraineesValue.includes(checkboxValue)) {
                checkbox.set('v.checked', true);
            }
        });
    },
    onModalClose : function(component, event, helper) {
        /* Update the list of selected trainees.
         * If the aura:iteration with lightning:input is replaced with
         * lightning:checkboxGroup, then this code needs to be modified to
         * get the value list from lightning:checkboxGroup
         */
        var shownTraineesValue = [];
        component.find('trainee-checkbox').forEach(function(checkbox) {
            if (checkbox.get('v.checked')) {
                shownTraineesValue.push(checkbox.get('v.value'));
            }
        });
        component.set('v.shownTraineesValue', shownTraineesValue);
        // update the chart
        helper.createChart(component, helper);
    },
    /* Used for testing */
    test : function(component, event, helper) {
        $A.util.removeClass(component.find('reportPanel'), 'hidden');
        helper.testServerRequest(component, helper);
    }
})