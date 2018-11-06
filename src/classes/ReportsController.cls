public class ReportsController {
	
    @AuraEnabled
    public static Map<Id, Decimal> getCumulativeScore(Integer year, ID batchID, Integer week, ID traineeID){
        List<Caliber_Grade__c> gradeList = getBatchGradesByWeek(batchID, week);
        
        // Calculate method will return a map of Contact ID and Avg week grade 
        Map<Id, Decimal> grades = new Map<Id, Decimal>();
        return grades;
        
    }//end of getCumulativeScore()
    
    @AuraEnabled
    public static List<Training__c> getBatchesByYear(Decimal year){
        Date startOfYear = date.newInstance((Integer)year, 1, 1);
        Date endOfYear = date.newInstance((Integer)year, 12, 31);
        List<Training__c> batchList =  [SELECT Id, Trainer__c, TrainingTrack__c, startDate__c
                                        FROM Training__c
                                        WHERE (startDate__c >= : startOfYear AND startDate__c <= : endOfYear) 
                                        OR (endDate__c >= : startOfYear AND endDate__c <= : endOfYear)];
        return batchList;
    }

    @AuraEnabled
    public static List<Caliber_Grade__c> getBatchGradesByWeek(ID batchID, Integer week){
        List<Caliber_Assessment__c> assessmentList = [SELECT Id
                                                      FROM Caliber_Assessment__c WHERE Training_Id__c = : batchID];
        List<Caliber_Grade__c> gList = [SELECT Id, Name, Contact__c, Score__c 
                                        FROM Caliber_Grade__c
                                        WHERE Caliber_Assessment__c IN : assessmentList];
        return gList;
    }
    
    @AuraEnabled
    public static List<Integer> GetAllYearsWithBatches(){
        List<AggregateResult> trainings = [select count(Id), CALENDAR_YEAR(StartDate__c) from Training__c group by CALENDAR_YEAR(StartDate__c)];
        List<Integer> years = new List<Integer>();
        for (AggregateResult ar : trainings){
            years.add((Integer)ar.get('expr1'));
        }
        return years;
    }
    
    //build a list of strings for all batches in year
    @AuraEnabled
    public static List<String> buildBatchStrings(List<Training__c> trainings){
        List<String> batchStrings = new List<String>();
        List<Id> trainerIds = new List<Id>();
        for (Training__c training : trainings){
            trainerIds.add(training.Trainer__c);
        }
        List<User> userTrainers = [select id, name from User where id in :trainerIds];
        for (Training__c training : trainings){
            for (User trainer : userTrainers){
                if (trainer.id == training.Trainer__c){
            		String tString = trainer.Name + ' ' + training.startDate__c.format();
            		batchStrings.add(tString);
                }
            }
        }
        return batchStrings;
    }
    
}//end of ReportsController class