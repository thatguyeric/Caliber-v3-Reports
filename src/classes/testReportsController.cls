@isTest
public class testReportsController {

    @isTest
    public static void testBatchOverallCumulativeScoresBar(){
        TestDataFactory.createData();
        Id batchID = [SELECT Id FROM Training__c LIMIT 1].Id;
        System.assert(batchID != null);
        String jsonResult = ReportsController.getBatchOverallCumulativeScoresBar(batchId);
        String expectedJson = '{"benchmark":60.00,"trainees":[{"grade":60.00,"name":"Duck, Donald"},{"grade":60.00,"name":"Mouse, Mickey"},{"grade":60.00,"name":"Duck, Daisy"}]}';
        System.assertEquals(expectedJson, jsonResult);
    }

    @isTest
    public static void testBatchOverallQCTable(){
        TestDataFactory.createData();
        Id batchID = [SELECT Id FROM Training__c LIMIT 1].Id;
        System.assert(batchID != null);
        String jsonResult = ReportsController.getBatchOverallQCTable(batchId);
        String expectedJson = '{"batchName":"9/10 -  - Salesforce","trainees":[{"weeklyData":[{"index":"1","note":"good job on week 1","grade":"Good"},{"index":"2","note":"good job on week 2","grade":"Good"},{"index":"3","note":"good job on week 3","grade":"Good"}],"name":"Duck, Donald"},{"weeklyData":[{"index":"1","note":"good job on week 1","grade":"Good"},{"index":"2","note":"good job on week 2","grade":"Good"},{"index":"3","note":"good job on week 3","grade":"Good"}],"name":"Mouse, Mickey"},{"weeklyData":[{"index":"1","note":"good job on week 1","grade":"Good"},{"index":"2","note":"good job on week 2","grade":"Good"},{"index":"3","note":"good job on week 3","grade":"Good"}],"name":"Duck, Daisy"}],"numOfWeeks":3,"batchWeeklyData":[{"index":"1","note":"good job on week 1","grade":"Good"},{"index":"2","note":"good job on week 2","grade":"Good"},{"index":"3","note":"good job on week 3","grade":"Good"}]}';
        System.assertEquals(expectedJson, jsonResult);
    }

    @isTest 
    public static void testBatchOverallTechSkillsRadar(){
        TestDataFactory.createData();
        Id batchID = [SELECT Id FROM Training__c LIMIT 1].Id;
        System.assert(batchID != null);
        String jsonResult = ReportsController.getBatchOverallTechSkillsRadar(batchId);
        String expectedJson = '{"trainees":[{"categories":[{"grade":50.00,"name":"SF Security"},{"grade":60.00,"name":"Apex"},{"grade":70.00,"name":"Visualforce"}],"name":"Duck, Donald"},{"categories":[{"grade":50.00,"name":"SF Security"},{"grade":60.00,"name":"Apex"},{"grade":70.00,"name":"Visualforce"}],"name":"Mouse, Mickey"},{"categories":[{"grade":50.00,"name":"SF Security"},{"grade":60.00,"name":"Apex"},{"grade":70.00,"name":"Visualforce"}],"name":"Duck, Daisy"}],"batch":{"name":"9/10 -  - Salesforce","categories":[{"grade":50.00,"name":"SF Security"},{"grade":60.00,"name":"Apex"},{"grade":70.00,"name":"Visualforce"}]}}';
        System.assertEquals(expectedJson, jsonResult);
    }

    //todo: finish test when grades are calculated
    @isTest
    public static void testBatchOverallWeeklyProgress(){
        TestDataFactory.createData();
        Id batchID = [SELECT Id FROM Training__c LIMIT 1].Id;
		String jsonResult = ReportsController.getBatchOverallWeeklyProgressLine(batchId);
    }
    
    @isTest
    public static void testGetYearsWithBatches(){
        TestDataFactory.createData();
        List<Integer> yearsWithBatch = ReportsController.GetAllYearsWithBatches();
        List<Integer> expectedYears = new List<Integer>();
        expectedYears.add(2018);
        expectedYears.add(2017);
        system.assertEquals(expectedYears, yearsWithBatch);
    }
    
    @isTest
    public static void testGetBatchesByYear(){
        TestDataFactory.createData();
        List<Training__c> batchesInYear2018 = ReportsController.getBatchesByYear(2018);
        List<Training__c> batchesInYear2017 = ReportsController.getBatchesByYear(2017);
        
        List<Training__c> expected2018Batches = [SELECT Id, Trainer__c, TrainingTrack__c, startDate__c, Caliber_Number_of_Weeks__c
                                        		FROM Training__c
                                                where CALENDAR_YEAR(startDate__c) = 2018 OR CALENDAR_YEAR(endDate__c) = 2018];
        system.assertEquals(expected2018Batches, batchesInYear2018);
        
        List<Training__c> expected2017Batches = [SELECT Id, Trainer__c, TrainingTrack__c, startDate__c, Caliber_Number_of_Weeks__c
                                        		FROM Training__c
                                                where CALENDAR_YEAR(startDate__c) = 2017 OR CALENDAR_YEAR(endDate__c) = 2017];
    	system.assertEquals(expected2017Batches, batchesInYear2017);
    }
    
    @isTest
    public static void testBuildBatchStrings(){
        TestDataFactory.createData();
        List<Training__c> batches = [select Trainer__c, startDate__c from Training__c];
        List<String> batchStrings = ReportsController.buildBatchStrings(batches);
        List<String> expectedStrings = new List<String>();
        //change based on name of your user
        expectedStrings.add('Cody Burchett 9/10/2018');
        expectedStrings.add('Cody Burchett 9/10/2017');
        system.assertEquals(expectedStrings, batchStrings);
    }
    
    @isTest
    public static void testBatchWeekStrings(){
        TestDataFactory.createData();
        Training__c batch = [select Caliber_Number_of_Weeks__c from Training__c limit 1];
        List<String> weekStrings = Reportscontroller.batchWeeksStrings(batch);
        List<String> expectedWeekStrings = new List<String>();
        expectedWeekStrings.add('Week 1');
        expectedWeekStrings.add('Week 2');
        expectedWeekStrings.add('Week 3');
        expectedWeekStrings.add('Week 4');
        system.assertEquals(expectedWeekStrings, weekStrings);
    }
    
    @isTest
    public static void testGetBatchTrainees(){
        TestDataFactory.createData();
        Training__c batch = [select id from Training__c limit 1];
        List<Contact> associates = ReportsController.batchTrainees(batch);
        
        List<Contact> expectedAssociates = [select id, Name from Contact];
        system.assertEquals(expectedAssociates, associates);
    }
    
    @isTest
    public static void testGetSelectedTrainee(){
        TestDataFactory.createData();
        List<Contact> associates = [select Name from Contact];
        String associateName = 'Mickey Mouse';
        //Contact actualAssociate = ReportsController.getSelectedTrainee(associates, associateName);
       // Contact expectedAssociate = [select id, Name from Contact where Name='Mickey Mouse' limit 1];
        //system.assertEquals(expectedAssociate, actualAssociate);
        //actualAssociate = ReportsController.getSelectedTrainee(associates, '');
        //system.assertEquals(null, actualAssociate);
    }
    
    @isTest
    public static void testGetSelectedBatch(){
        TestDataFactory.createData();
        List<Training__c> batches = [select startDate__c from Training__c];
        String startDate = '9/10/2018';
        Training__c actualTraining = ReportsController.getSelectedBatch(batches, startDate);
        Date start = Date.newInstance(2018, 9, 10);
        Training__c expectedBatch = [select startDate__c, Id from Training__c where startDate__c = :start limit 1];
        system.assertEquals(expectedBatch, actualTraining);
        startDate = 'balogni';
        actualTraining = ReportsController.getSelectedBatch(batches, startDate);
        system.assertEquals(null, actualTraining);
    }

}