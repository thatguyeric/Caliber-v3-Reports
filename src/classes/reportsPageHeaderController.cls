public class reportsPageHeaderController {
	//todo: replace methods with calls to helper functions that other team is working on
    
    @AuraEnabled
    public static List<String> GetAllYearsWithBatches(){
        List<AggregateResult> trainings = [select count(Id), CALENDAR_YEAR(StartDate__c) from Training__c group by CALENDAR_YEAR(StartDate__c)];
        List<String> years = new List<String>();
        for (AggregateResult ar : trainings){
            years.add(string.valueOf(ar.get('expr1')));
        }
        return years;
    }
}