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
    // get trainees that are part of a batch
    public static List<Id> getTraineeIDs(Id batchID){
        List<Id> traineeIDs = new List<Id>();
        for (Training_Assignment__c t : [SELECT Contact__c FROM Training_Assignment__c WHERE Training__c = : batchID]){
            traineeIDs.add(t.Contact__c);
        }
        return traineeIDs;
    }
    
    public static Decimal getAverageGrade(List<Decimal> grades){
        Decimal grade = 0;
        if (grades.size() > 0){
            for (Decimal g : grades){
                grade += g;
            }
            return grade = grade / grades.size() * 100;
        }
        return null;
    }
    
    public static Map<String, Object> mapTraineesAndGrades(Id traineeID, List<Caliber_Grade__c> gradesList){
        List<Decimal> traineeGrades = new List<Decimal>();
        Map<String, Object> traineeMap = new Map<String, Object>();
        String fullName;
        for (Caliber_Grade__c g : gradesList){
            if (g.Contact__c == traineeID){
                fullName = g.Contact__r.LastName + ', ' + g.Contact__r.FirstName;
                traineeGrades.add(getGradePercentage(g.Score__c, g.Caliber_Assessment__r.Max_Points__c));
            }
        }
        traineeMap.put('name', fullName);
        traineeMap.put('grade', getAverageGrade(traineeGrades));
        return traineeMap;
    }
    
    @AuraEnabled
    public static String getBatchOverallCumulativeScoresBar(Id batchID){
        Map<String, Object> dataToSend = new Map<String, Object>();
        List<Map<String, Object>> trainees = new List<Map<String, Object>>();
        List<Id> traineeIDs = getTraineeIDs(batchID);
        
        // get all grades associated with each trainee
        List<Caliber_Grade__c> gradesList = [SELECT Id, Contact__c, Contact__r.FirstName, Contact__r.LastName, 
                                             Score__c, Caliber_Assessment__r.Max_Points__c 
                                             FROM Caliber_Grade__c
                                             WHERE Contact__c IN : traineeIDs];
        
        // Calculate grade of each student and add them to list
        for (Id tID : traineeIDs){
            trainees.add(mapTraineesAndGrades(tID, gradesList));
        }
        
        Id trainingTrackID = [SELECT TrainingTrack__c FROM Training__c WHERE Id = : batchID].TrainingTrack__c;

        // get all caliber grades of current training track to calculate benchmark 
        List<Decimal> allTrainingTrackGrades = new List<Decimal>();
        for (Caliber_Grade__c g : [SELECT Score__c, Caliber_Assessment__r.Max_Points__c FROM Caliber_Grade__c WHERE Caliber_Assessment__r.Training_Id__r.TrainingTrack__c = : trainingTrackID]){
            allTrainingTrackGrades.add(getGradePercentage(g.Score__c, g.Caliber_Assessment__r.Max_Points__c));
        }
        
        // add to map to return to javaScript controller
        dataToSend.put('trainees', trainees);
        dataToSend.put('benchmark', getAverageGrade(allTrainingTrackGrades));
        
        return JSON.serialize(dataToSend);
    }
    
    @AuraEnabled
    public static String getBatchOverallQCTable(Id batchID){
        Map<String, Object> dataToSend = new Map<String, Object>();
        List<Id> traineeIDs = new List<Id>();
        List<Map<String, Object>> traineeData = new List<Map<String, Object>>();
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
        List<Training_Assignment__c> traineeList = [SELECT Contact__c, Contact__r.FirstName, Contact__r.LastName, Training__r.TrainingClass__c
                                                    FROM Training_Assignment__c WHERE Training__c = : batchID];
        
        //get batch name
        String batchName = traineeList[0].Training__r.TrainingClass__c;
        
        // get trainees that are a part of current batch
        for (Training_Assignment__c t : traineeList){
            traineeIDs.add(t.Contact__c);
        }
        
        // seperate trainee notes/grades 
        for (Training_Assignment__c t : traineeList){
            List<Map<String, String>> weeklyData = new List<Map<String, String>>();
            String fullName;
            for (integer i = 1; i < numOfWeeks+1; i++){
                String traineeGrade;
                String traineeNote;
                for (Caliber_Note__c n : qcList){
                    if (n.Contact__c == t.Contact__c && n.Note_Type__c == 'QC Trainee' && n.Week_Number__c == i){
                        traineeGrade = n.QC_Status__c;
                        traineeNote = n.Note_Content__c;
                        break;
                    }
                }
                Map<String, String> weeklyDataMap = new Map<String, String>();
                weeklyDataMap.put('grade', traineeGrade);
                weeklyDataMap.put('note', traineeNote);
                weeklyDataMap.put('index', String.valueOf(i));
                weeklyData.add(weeklyDataMap);
            }
            
            Map<String, Object> traineeMap = new Map<String, Object>();
            fullName = t.Contact__r.LastName + ', ' + t.Contact__r.FirstName;
            traineeMap.put('name', fullName);
            traineeMap.put('weeklyData', weeklyData);
            traineeData.add(traineeMap);
        }
        
        // seperate batch notes/grades
        List<Map<String, Object>> batchWeekList = new List<Map<String, Object>>();
        String grade;
        String note;
        for (integer i = 1; i <= numOfWeeks; i++){
            for (Caliber_Note__c n : qcList){
                if (n.Note_Type__c == 'QC Batch' && n.Week_Number__c == i){
                    grade = n.QC_Status__c;
                    note = n.Note_Content__c;
                    break;
                }
            }
            Map<String, Object> batchWeeklyData = new Map<String, Object>();
            batchWeeklyData.put('grade', grade);
            batchWeeklyData.put('note', note);
            batchWeeklyData.put('index', String.valueOf(i));
            batchWeekList.add(batchWeeklyData);
        }
        
        // add to map to return to javaScript controller
        dataToSend.put('batchWeeklyData', batchWeekList);
        dataToSend.put('numOfWeeks', numOfWeeks);
        dataToSend.put('trainees', traineeData);
        dataToSend.put('batchName', traineeList[0].Training__r.TrainingClass__c);
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
        Map<String, Object> dataToSend = new Map<String, Object>();
        
        // get all categories and traineeIDs and put into sets
        Set<String> batchCategories = new Set<String>();
        Set<Id> traineeIDset = new Set<Id>();
        for (Caliber_Grade__c g : allData){
            batchCategories.add(g.Caliber_Assessment__r.Assessment_Category__r.Name);
            traineeIDset.add(g.Contact__c);
        }
        List<Id> traineeIdList = new List<Id>(traineeIDset);
        
        // for each category calculate grades and get names
        List<String> categoryList = new List<String>(batchCategories);
        for (String cat : categoryList){
            List<Decimal> grades = getAllGradePercentagesByCategory(allData, cat);
            Map<String, Object> batchCategory = new Map<String, Object>();
            batchCategory.put('name', cat);
            batchCategory.put('grade', getAverageGrade(grades));
            categories.add(batchCategory);
        }
        
        // add name and category to batch map        
        Map<String, Object> batch = new Map<String, Object>();
        batch.put('categories', categories);
        batch.put('name', allData[0].Caliber_Assessment__r.Training_Id__r.TrainingClass__c);
        
        dataToSend.put('batch', batch);
        
        // do the same for each trainee
        List<Map<String, Object>> traineeList = new List<Map<String, Object>>();
        
        // get grades and names for each trainee
        for (Id t : traineeIdList){
            List<Map<String, Object>> traineeCatList = new List<Map<String, Object>>();
            String traineeName;
            for (String cat : categoryList){
                List<Decimal> grades = new List<Decimal>();
                for (Caliber_Grade__c g : allData){
                    if (t == g.Contact__c){
                        if (g.Caliber_Assessment__r.Assessment_Category__r.Name == cat){
                            traineeName = g.Contact__r.LastName + ', ' + g.Contact__r.FirstName;
                            grades.add(getGradePercentage(g.Score__c, g.Caliber_Assessment__r.Max_Points__c));
                        }
                    }
                }
                Map<String, Object> traineeCategory = new Map<String, Object>();
                traineeCategory.put('name', cat);
                traineeCategory.put('grade', getAverageGrade(grades));
                traineeCatList.add(traineeCategory);
            }
            
            // calculate the trainee's category average
            Map<String, Object> traineeMap = new Map<String, Object>();
            traineeMap.put('name', traineeName);
            traineeMap.put('categories', traineeCatList);
            traineeList.add(traineeMap); 
        }
        dataToSend.put('trainees', traineeList);
        
        return JSON.serialize(dataToSend);
    }
    
    static Decimal getGradePercentage(Decimal score, Decimal maxScore){
        return score / maxScore;
    }
    
    public static List<Decimal> getAllGradePercentagesByCategory(List<Caliber_Grade__c> allData, String name){
        List<Decimal> grades = new List<Decimal>();
        for (Caliber_Grade__c g : allData){
            if (g.Caliber_Assessment__r.Assessment_Category__r.Name == name){
                grades.add(getGradePercentage(g.Score__c, g.Caliber_Assessment__r.Max_Points__c));
            }
        }
        return grades;
    }
    
    public static List<Decimal> getAllGradePercentagesByWeek(List<Caliber_Grade__c> gradesList, Integer weekNum){
        List<Decimal> scores = new List<Decimal>();
        for (Caliber_Grade__c g : gradesList){
            if (g.Caliber_Assessment__r.Week_Number__c == weekNum){
                scores.add(getGradePercentage(g.Score__c, g.Caliber_Assessment__r.Max_Points__c));
            }
        }
        return scores;
    }
    
    public static Training__c getBatchById(Id batchId){
        return [select id, caliber_number_of_weeks__c from Training__c where id = :batchId limit 1];
    }
    
    public static List<Caliber_Grade__c> getGradesForBatch(Id batchId){
        return [SELECT Id, Contact__c, Contact__r.FirstName, Contact__r.LastName, 
                                             Score__c, Caliber_Assessment__r.Max_Points__c, Caliber_Assessment__r.Training_Id__c,
                                             Caliber_Assessment__r.Week_Number__c
                                             FROM Caliber_Grade__c
                                             WHERE Caliber_Assessment__r.Training_Id__c = :batchId];
    }
    
    @AuraEnabled
    public static String getBatchOverallWeeklyProgressLine(Id batchID){
        Training__c batch = getBatchById(batchId);
        Map<String, Object> dataToSend = new Map<String, Object>();
        List<Map<String, Object>> calculatedGrades = new List<Map<String, Object>>();
        List<Decimal> scores = new List<Decimal>();
        
        //get the list of all grades for the batch
        List<Caliber_Grade__c> gradesList = getGradesForBatch(batchId);
        //average each weeks grades
        for (Integer weekNum = 0; weekNum < batch.caliber_number_of_weeks__c; weekNum++){
            scores.clear();
            scores = getAllGradePercentagesByWeek(gradesList, weekNum);
            if (scores.size() > 0){
            	Decimal avgOfAllGrades = getAverageGrade(scores);
                Map<String, Object> weekMap = new Map<String, Object>();
                weekMap.put('week', weekNum);	
                weekMap.put('grade', avgOfAllGrades);
                calculatedGrades.add(weekMap);
            }
        }
        dataToSend.put('batch', calculatedGrades);
        return JSON.serialize(dataToSend);
    }
}//end of ReportsController class