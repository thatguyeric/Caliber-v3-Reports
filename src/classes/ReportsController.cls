public class ReportsController {
    
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
    
    @AuraEnabled
    public static String getBatchOverallCumulativeScoresBar(Id batchID){
        Map<String, Object> dataToSend = new Map<String, Object>();
        List<Id> traineeIDs = new List<Id>();
        Map<String, Object> traineeMap = null;
        List<Map<String, Object>> gradesToCalculate = new List<Map<String, Object>>();
        List<Decimal> scores = new List<Decimal>();
        List<Decimal> maxPoints = new List<Decimal>();
        String fullName;
        
        // get trainees that are a part of current batch
        for (Training_Assignment__c t : [SELECT Contact__c FROM Training_Assignment__c WHERE Training__c = : batchID]){
            traineeIDs.add(t.Contact__c);
        }
        // get all grades associated with each trainee
        List<Caliber_Grade__c> gradesList = [SELECT Id, Contact__c, Contact__r.FirstName, Contact__r.LastName, 
                                             Score__c, Caliber_Assessment__r.Max_Points__c 
                                             FROM Caliber_Grade__c
                                             WHERE Contact__c IN : traineeIDs];
        

        
        // get all scores and maxpoints for each trainee, map them and put them into a list to calculate grades
        for (Id tID : traineeIDs){
            scores.clear();
            maxPoints.clear();
            for (Caliber_Grade__c g : gradesList){
                if (g.Contact__c == tID){
                    fullName = g.Contact__r.LastName + ', ' + g.Contact__r.FirstName;
                    scores.add(g.Score__c);
                    maxPoints.add(g.Caliber_Assessment__r.Max_Points__c);
                }
            }
            traineeMap = new Map<String, Object>();
            traineeMap.put('name', fullName);
            traineeMap.put('score', scores);	
            traineeMap.put('maxPoints', maxPoints);
            gradesToCalculate.add(traineeMap);
        }
        
        
        for (Map<String, Object> m : gradesToCalculate){
            system.debug(m);
        }
        
        // calculate grades from gradesToCalculate list
		// should return List<Map<String, Object>>
		List<Map<String, Object>> data = null;
		// calculate benchmark 
		// should return single decimal 
		Decimal benchmark = 0;
        dataToSend.put('data', gradesToCalculate);
        dataToSend.put('benchmark', benchmark);
        system.debug(JSON.serialize(dataToSend));
        
        return JSON.serialize(dataToSend);
    }
    
    @AuraEnabled
    public static String getBatchOverallQCTable(Id batchID){
        Map<String, Object> dataToSend = new Map<String, Object>();
        Map<String, Object> traineeMap = null;
        
        // get all QC scores and feedback for batch
       	List<Caliber_Note__c> qcList = [SELECT Id, Contact__r.FirstName, Contact__r.LastName, Is_QC_Feedback__c, 
                                        Note_Content__c, Week_Number__c, QC_Status__c
                                        FROM Caliber_Note__c WHERE Training__c = : batchID];
        
        
        
        /*{
            numOfWeeks : Integer,
            data : [{
                name : String,
                qcGrades : Integer[]
            }]
        }*/
        return 'todo';
    }
        
}//end of ReportsController class