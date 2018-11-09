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
    public static Contact getSelectedTrainee(List<Contact> allTrainees, String traineeName){
        for (Contact trainee : allTrainees){
            if (trainee.Name == traineeName){
                return trainee;
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
    public static String getBatchOverallCumulativeScoresBar(Id batchID){
        Map<String, Object> dataToSend = new Map<String, Object>();
        List<Id> traineeIDs = new List<Id>();
        Map<String, Object> traineeMap = null;
        List<Map<String, Object>> trainees = new List<Map<String, Object>>();
        List<Map<String, Object>> benchmarkList = new List<Map<String, Object>>();
        String fullName;
        
        List<Training_Assignment__c> taList = [SELECT Contact__c, Training__r.TrainingTrack__c 
                                               FROM Training_Assignment__c WHERE Training__c = : batchID];
        // get trainees that are a part of current batch
        for (Training_Assignment__c t : taList){
            traineeIDs.add(t.Contact__c);
        }
        
        // get all grades associated with each trainee
        List<Caliber_Grade__c> gradesList = [SELECT Id, Contact__c, Contact__r.FirstName, Contact__r.LastName, 
                                             Score__c, Caliber_Assessment__r.Max_Points__c 
                                             FROM Caliber_Grade__c
                                             WHERE Contact__c IN : traineeIDs];
        
        // Calculate grade of each student
        List<Decimal> grades = new List<Decimal>();
        for (Id tID : traineeIDs){
            grades = new List<Decimal>();
            for (Caliber_Grade__c g : gradesList){
                if (g.Contact__c == tID){
                    fullName = g.Contact__r.LastName + ', ' + g.Contact__r.FirstName;
                    grades.add(g.Score__c / g.Caliber_Assessment__r.Max_Points__c);
                }
            }
            Decimal grade = 0;
            for (Decimal g : grades){
                grade += g;
            }
            grade = grade / grades.size() * 100;
            
            traineeMap = new Map<String, Object>();
            traineeMap.put('name', fullName);
            traineeMap.put('grade', grade);
            trainees.add(traineeMap);
        }
        
        // get all caliber grades of current training track to calculate benchmark 
        Id trainingTrackID = taList[0].Training__r.TrainingTrack__c;
        List<Caliber_Grade__c> trainingTrackList = [SELECT Score__c, Caliber_Assessment__r.Max_Points__c 
                                                    FROM Caliber_Grade__c
                                                    WHERE Caliber_Assessment__r.Training_Id__r.TrainingTrack__c = : trainingTrackID ];
        
        // Calculate benchmark
        Decimal benchmark = 0;
        grades = new List<Decimal>();
        for (Caliber_Grade__c g : trainingTrackList){
            grades.add(g.Score__c / g.Caliber_Assessment__r.Max_Points__c);
        }
        for (Decimal g : grades){
            benchmark += g;
        }
        benchmark = benchmark / grades.size() * 100;
        
        // add to map to return to javaScript controller
        dataToSend.put('trainees', trainees);
        dataToSend.put('benchmark', benchmark);
        
        return JSON.serialize(dataToSend);
    }
    
    @AuraEnabled
    public static String getBatchOverallQCTable(Id batchID){
        Map<String, Object> dataToSend = new Map<String, Object>();
        Map<String, Object> traineeMap = null;
        List<Id> traineeIDs = new List<Id>();
        List<Map<String, Object>> traineeData = new List<Map<String, Object>>();
        String fullName;
        List<Map<String, String>> weeklyData = new List<Map<String, String>>();
        Map<String, String> weeklyDataMap = null;
        String traineeGrade;
        String traineeNote;
        List<String> batchNotes = new List<String>();
        List<String> batchGrades = new List<String>();
        
        // find out number of weeks this batch has
        Integer numOfWeeks = (Integer)[SELECT COUNT_DISTINCT(Week_Number__c) weeks 
                                       FROM Caliber_Note__c WHERE Training__c = : batchID][0].get('weeks');
        
        // get all QC scores and feedback for batch and trainees in order by week
        List<Caliber_Note__c> qcList = [SELECT Id, Note_Content__c, Week_Number__c, QC_Status__c, Note_Type__c, Contact__c
                                        FROM Caliber_Note__c WHERE Training__c = : batchID AND Is_QC_Feedback__c = true 
                                        ORDER BY Week_Number__c ASC];
        
        // get trainees in batch
        List<Training_Assignment__c> traineeList = [SELECT Contact__c, Contact__r.FirstName, Contact__r.LastName 
                                                    FROM Training_Assignment__c WHERE Training__c = : batchID];
        
        // get trainees that are a part of current batch
        for (Training_Assignment__c t : traineeList){
            traineeIDs.add(t.Contact__c);
        }
        
        // seperate trainee notes/grades 
        for (Training_Assignment__c t : traineeList){
            weeklyData = new List<Map<String, String>>();
            for (integer i = 1; i < numOfWeeks+1; i++){
                for (Caliber_Note__c n : qcList){
                    if (n.Contact__c == t.Contact__c && n.Note_Type__c == 'QC Trainee' && n.Week_Number__c == i){
                        traineeGrade = n.QC_Status__c;
                        traineeNote = n.Note_Content__c;
                    }
                }
                weeklyDataMap = new Map<String, String>();
                weeklyDataMap.put('grade', traineeGrade);
                weeklyDataMap.put('note', traineeNote);
                weeklyData.add(weeklyDataMap);
            }
            
            traineeMap = new Map<String, Object>();
            fullName = t.Contact__r.LastName + ', ' + t.Contact__r.FirstName;
            traineeMap.put('name', fullName);
            traineeMap.put('weeklyData', weeklyData);
            traineeData.add(traineeMap);
        }
        
        // seperate batch notes/grades
        for (Caliber_Note__c n : qcList){
            if (n.Note_Type__c == 'QC Batch'){
                batchGrades.add(n.QC_Status__c);
                batchNotes.add(n.Note_Content__c);
            }
        }
        
        // add to map to return to javaScript controller
        dataToSend.put('numOfWeeks', numOfWeeks);
        dataToSend.put('trainees', traineeData);
        dataToSend.put('batchGrades', batchGrades);
        dataToSend.put('batchNotes', batchNotes);
        return JSON.serialize(dataToSend);
    }
    
    @AuraEnabled
    public static String getBatchOverallTechSkillsRadar(Id batchID){
        List<Caliber_Grade__c> allData = [SELECT Id, Score__c, Caliber_Assessment__r.Assessment_Category__r.Name, 
                                          Caliber_Assessment__r.Training_Id__r.TrainingClass__c,
                                          Caliber_Assessment__r.Max_Points__c, Caliber_Assessment__r.Training_Id__r.Trainer__r.Name, 
                                          Caliber_Assessment__r.Training_Id__r.StartDate__c, Contact__r.FirstName, Contact__r.LastName
                                          FROM Caliber_Grade__c WHERE Caliber_Assessment__r.Training_Id__c = : batchID];
        
        List<Map<String, Object>> categories = new List<Map<String, Object>>();
        Map<String, Object> batchCategory = null;
        List<Decimal> scores = null;
        List<Decimal> maxPoints = null;
        Map<String, Object> dataToSend = new Map<String, Object>();
        Set<Id> traineeIDs = new Set<Id>();
        
        // get all categories, put into set
        Set<String> categoryList = new Set<String>();
        for (Caliber_Grade__c g : allData){
            categoryList.add(g.Caliber_Assessment__r.Assessment_Category__r.Name);
            traineeIDs.add(g.Contact__c);
        }
        
        // for each category calculate grades and get names
        List<Decimal> grades = new List<Decimal>();
        for (String cat : categoryList){
            grades = new List<Decimal>();
            for (Caliber_Grade__c g : allData){
                if (g.Caliber_Assessment__r.Assessment_Category__r.Name == cat){
                    grades.add(g.Score__c / g.Caliber_Assessment__r.Max_Points__c);
                }
            }
            Decimal grade = 0;
            for (Decimal g : grades){
                grade += g;
            }
            grade = grade / grades.size() * 100;
            batchCategory = new Map<String, Object>();
            batchCategory.put('name', cat);
            batchCategory.put('grade', grade);
            categories.add(batchCategory);
        }
        
        // get batch name
        String name = allData[0].Caliber_Assessment__r.Training_Id__r.TrainingClass__c;
        
        // add name and category to batch map        
        Map<String, Object> batch = new Map<String, Object>();
        batch.put('categories', categories); // categories goes here
        batch.put('name', name);
        
        dataToSend.put('batch', batch);
        
        // do the same for each trainee
        Map<String, Object> traineeCategory = null;
        Map<String, Object> traineeMap = null;
        List<Map<String, Object>> traineeGradesToCalculate = new List<Map<String, Object>>();
        List<Map<String, Object>> traineeList = new List<Map<String, Object>>();
        List<Map<String, Object>> traineeCatList = null;
        String traineeName;
        List<Id> tList = new List<Id>(traineeIDs);
        
        // get grades and names for each trainee
        for (Id t : tList){
            traineeCatList = new List<Map<String, Object>>();
            for (String cat : categoryList){
                grades = new List<Decimal>();
                for (Caliber_Grade__c g : allData){
                    if (t == g.Contact__c){
                        if (g.Caliber_Assessment__r.Assessment_Category__r.Name == cat){
                            traineeName = g.Contact__r.LastName + ', ' + g.Contact__r.FirstName;
                            grades.add(g.Score__c / g.Caliber_Assessment__r.Max_Points__c);
                        }
                    }
                }
                Decimal grade = 0;
                for (Decimal g : grades){
                    grade += g;
                }
                grade = grade / grades.size() * 100;
                traineeCategory = new Map<String, Object>();
                traineeCategory.put('name', cat);
                traineeCategory.put('grade', grade);
                traineeCatList.add(traineeCategory);
            }
            
            // calculate the trainee's category average
            traineeMap = new Map<String, Object>();
            traineeMap.put('name', traineeName);
            traineeMap.put('categories', traineeCatList); // traineeCatList goes here
            traineeList.add(traineeMap); 
        }
        
        dataToSend.put('trainees', traineeList);
        
        return JSON.serialize(dataToSend);
    }
    
}//end of ReportsController class