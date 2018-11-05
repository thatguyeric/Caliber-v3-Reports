public class ReportsController {
	
    @AuraEnabled
    public static List<Caliber_Grade__c> getCumulativeScore(Integer year, ID batchID, Integer week, ID traineeID){
        List<Caliber_Grade__c> gradeList = new List<Caliber_Grade__c>();        
        
        return gradeList;
    }//end of barChart()

    
    public static List<Training__c> getBatchesByYear(Integer year){
        Date startOfYear = date.newInstance(year, 1, 1);
        Date endOfYear = date.newInstance(year, 12, 31);
        List<Training__c> batchList =  [SELECT Id, Trainer__c, TrainingTrack__c 
                                        FROM Training__c 
                                        WHERE (startDate__c >= : startOfYear AND startDate__c <= : endOfYear) 
                                        OR (endDate__c >= : startOfYear AND endDate__c <= : endOfYear)];
        system.debug(batchList);
        return batchList;
    }
    
    public static List<Caliber_Grade__c> getBatchGradesByWeek(ID batchID, Integer week){
        List<Caliber_Assessment__c> assessmentList = [SELECT Id 
                                                      FROM Caliber_Assessment__c WHERE Training_Id__c = : batchID];
        
        List<Caliber_Grade__c> gList = [SELECT Id, Name, Contact__c, Score__c 
                                        FROM Caliber_Grade__c
                                        WHERE Caliber_Assessment__c IN : assessmentList];
        
        // call on calculate class 
        
        return gList;
    }
    
}//end of ReportsController class