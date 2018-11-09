public class ReportsController {
    
    //return all batches starting or ending in a specific year
    @AuraEnabled
    public static List<Training__c> getBatchesByYear(Decimal year){
        Date startOfYear = date.newInstance((Integer)year, 1, 1);
        Date endOfYear = date.newInstance((Integer)year, 12, 31);
        List<Training__c> batchList =  [SELECT Id, Trainer__c, TrainingTrack__c, startDate__c, Caliber_Number_of_Weeks__c
                                        FROM Training__c
                                        WHERE (startDate__c >= : startOfYear AND startDate__c <= : endOfYear) 
                                        OR (endDate__c >= : startOfYear AND endDate__c <= : endOfYear)];
        return batchList;
    }
    
    //return list of years that have batches starting in them
    //todo: replace aggregate result with list that gets converted to set?
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
    //return the number of weeks in a batch
    public static Decimal getWeeksInBatch(Training__c batch){
        return batch.Caliber_Number_of_Weeks__c;
    }
    
    //return strings for each week in a batch
    @AuraEnabled
    public static List<String> batchWeeksStrings(Training__c batch){
        Decimal weeksInBatch = ReportsController.getWeeksInBatch(batch);
        List<String> weekStrings = new List<String>();
        weekStrings.add('Week (All)');
        for (Integer i = 1; i <= (Integer)weeksInBatch; i++){
            weekStrings.add('Week ' + i);
        }
        return weekStrings;
    }
    //return all trainees in a batch
    @AuraEnabled
    public static List<Contact> batchTrainees(Training__c batch){
        List<Training_Assignment__c> assignments = [select id, Contact__c from Training_Assignment__c where training__c = :batch.id];
        List<Id> traineeContactIds = new List<Id>();
        for (Training_Assignment__c assignment : assignments){
            traineeContactIds.add(assignment.contact__c);
        }
        return [select id, name from Contact where id in :traineeContactIds];
    }
    //return the selected trainee's info
    @AuraEnabled
    public static Contact getSelectedTrainee(List<Id> allTraineeIds, String traineeName){
        List<Contact> contacts = [select id, Name from Contact where id in :allTraineeIds];
        for (Contact contact : contacts){
            if (contact != null){
                if (contact.Name == traineeName){
                    system.debug(contact);
                    return contact;
                }
            }
        }
        return null;
    }
    //return the batch info for selected batch
    @AuraEnabled
    public static Training__c getSelectedBatch(List<Training__c> batches, String batchName){
        for (Training__c batch : batches){
            if (batchName.contains(batch.StartDate__c.format())){
                return batch;
            }
        }
        return null;
    }
	
    @AuraEnabled
    public static String getBatchOverallWeeklyProgressLine(Id batchID){
        Training__c batch = [select id, caliber_number_of_weeks__c from Training__c where id = :batchId limit 1];
        Map<String, Object> dataToSend = new Map<String, Object>();
        Map<String, Object> weekMap = null;
        List<Map<String, Object>> gradesToCalculate = new List<Map<String, Object>>();
        List<Decimal> scores = new List<Decimal>();
        List<Decimal> maxPoints = new List<Decimal>();
        String fullName;
        
        List<Caliber_Grade__c> gradesList = [SELECT Id, Contact__c, Contact__r.FirstName, Contact__r.LastName, 
                                             Score__c, Caliber_Assessment__r.Max_Points__c, Caliber_Assessment__r.Training_Id__c,
                                             Caliber_Assessment__r.Week_Number__c
                                             FROM Caliber_Grade__c
                                             WHERE Caliber_Assessment__r.Training_Id__c = :batch.id];
        system.debug(batch.Caliber_Number_of_Weeks__c);
        for (Integer weekNum = 0; weekNum < batch.caliber_number_of_weeks__c; weekNum++){
            scores.clear();
            maxPoints.clear();
            for (Caliber_Grade__c g : gradesList){
                if (g.Caliber_Assessment__r.Week_Number__c == weekNum){
                    scores.add(g.Score__c);
                    maxPoints.add(g.Caliber_Assessment__r.Max_Points__c);
                }
            }
            weekMap = new Map<String, Object>();
            weekMap.put('score', scores);	
            weekMap.put('maxPoints', maxPoints);
            gradesToCalculate.add(weekMap);
        }
        
        // calculate grades from gradesToCalculate list
        // should return List<Map<String, Object>>
        List<Map<String, Object>> data = null;
        
        dataToSend.put('week', data);
        
        return JSON.serialize(dataToSend);
    }
}//end of ReportsController class