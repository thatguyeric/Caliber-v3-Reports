({
    
    handleReportFilterChange : function(component, event, helper) {
        helper.getCurrentBatch(component, event, helper);
        helper.getBatchCat(component, event, helper);
    }
})